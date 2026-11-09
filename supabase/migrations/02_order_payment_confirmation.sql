-- ==============================================================================
-- 02 — Confirmación manual de pago y descuento de stock diferido
-- ------------------------------------------------------------------------------
-- El stock ya NO se descuenta al crear el pedido. Se descuenta recién cuando
-- el admin confirma el pago desde /admin/pedidos (confirm_order_payment).
-- Correr este archivo completo en Supabase → SQL Editor.
-- ==============================================================================

-- 1. Nuevas columnas en orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- status ya admite: 'pendiente', 'confirmado', 'entregado', 'cancelado' (ver 01_schema.sql)

CREATE INDEX IF NOT EXISTS orders_status_created_at_idx
    ON public.orders (status, created_at);


-- 2. Confirmar pago: descuenta stock de forma atómica
--    Cualquier RAISE EXCEPTION revierte TODA la transacción (nada queda a medias).
CREATE OR REPLACE FUNCTION public.confirm_order_payment(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
    v_item   RECORD;
    v_rows   INTEGER;
    v_stock  INTEGER;
BEGIN
    -- Bloquea el pedido: evita doble confirmación (doble click / dos pestañas)
    SELECT status INTO v_status
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El pedido no existe.' USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'pendiente' THEN
        RAISE EXCEPTION 'El pedido ya está en estado "%" y no se puede confirmar.', v_status
            USING ERRCODE = 'P0001';
    END IF;

    FOR v_item IN
        SELECT variant_id, product_name, color_name, quantity
        FROM public.order_items
        WHERE order_id = p_order_id
        ORDER BY variant_id  -- orden fijo para evitar deadlocks entre confirmaciones simultáneas
    LOOP
        IF v_item.variant_id IS NULL THEN
            RAISE EXCEPTION 'STOCK: "%" (%) ya no existe en el catálogo.',
                v_item.product_name, COALESCE(v_item.color_name, 'sin color');
        END IF;

        -- UPDATE condicional: solo descuenta si alcanza (a prueba de condiciones de carrera)
        UPDATE public.product_variants
        SET stock = stock - v_item.quantity
        WHERE id = v_item.variant_id
          AND stock >= v_item.quantity;

        GET DIAGNOSTICS v_rows = ROW_COUNT;

        IF v_rows = 0 THEN
            SELECT stock INTO v_stock FROM public.product_variants WHERE id = v_item.variant_id;
            RAISE EXCEPTION 'STOCK: "%" (%) — pedido: %, disponible: %.',
                v_item.product_name, COALESCE(v_item.color_name, 'sin color'),
                v_item.quantity, COALESCE(v_stock, 0);
        END IF;
    END LOOP;

    UPDATE public.orders
    SET status = 'confirmado',
        payment_confirmed_at = NOW()
    WHERE id = p_order_id;
END;
$$;


-- 3. Cancelar pedido: si ya estaba confirmado, devuelve el stock
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID, p_reason TEXT DEFAULT 'cancelado_por_admin')
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El pedido no existe.' USING ERRCODE = 'P0002';
    END IF;

    IF v_status = 'cancelado' THEN
        RAISE EXCEPTION 'El pedido ya estaba cancelado.';
    END IF;

    -- Solo los pedidos con pago confirmado descontaron stock → devolverlo
    IF v_status IN ('confirmado', 'entregado') THEN
        UPDATE public.product_variants pv
        SET stock = pv.stock + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
          AND oi.variant_id = pv.id;
    END IF;

    UPDATE public.orders
    SET status = 'cancelado',
        cancelled_at = NOW(),
        cancel_reason = p_reason
    WHERE id = p_order_id;
END;
$$;


-- 4. SEGURIDAD: las funciones del esquema public se exponen por la API REST.
--    Sin esto, cualquiera con la anon key (visible en el navegador) podría llamarlas.
REVOKE ALL ON FUNCTION public.confirm_order_payment(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_order(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID, TEXT) TO service_role;
