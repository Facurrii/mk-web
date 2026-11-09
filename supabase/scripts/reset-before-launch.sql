-- ==============================================================================
-- LIMPIEZA ANTES DEL LANZAMIENTO
-- ------------------------------------------------------------------------------
-- Borra TODOS los pedidos (y sus ítems) y reinicia la numeración desde #1.
-- NO toca productos, variantes, stock, fotos ni categorías.
--
-- ⚠ Es irreversible. Correrlo UNA sola vez, el día que el sitio sale al público,
--   en Supabase → SQL Editor.
-- ==============================================================================

BEGIN;

TRUNCATE TABLE public.order_items, public.orders RESTART IDENTITY;

COMMIT;

-- Si preferís que el primer pedido real sea #101 en vez de #1, corré además:
-- ALTER SEQUENCE public.orders_order_number_seq RESTART WITH 101;


-- ------------------------------------------------------------------------------
-- Verificación: después de correrlo, esto tiene que devolver 0.
-- ------------------------------------------------------------------------------
-- SELECT COUNT(*) FROM public.orders;
