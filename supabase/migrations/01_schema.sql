-- ==============================================================================
-- 1. TABLA: CATEGORÍAS (Costura, Trabajo, Cotidiano)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABLA: PRODUCTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price NUMERIC(12, 2) DEFAULT NULL, -- NULL si es "Precio a definir"
    is_active BOOLEAN DEFAULT TRUE,          -- Para pausar publicación
    is_featured BOOLEAN DEFAULT FALSE,      -- Para destacar en la portada
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLA: VARIANTES DE COLOR (Gris, Bordó, Verde, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,                -- ej: "Gris", "Bordó", "Verde"
    color_hex TEXT,                         -- ej: "#71717A", "#800020", "#2D5A27"
    stock INTEGER DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLA: IMÁGENES DE PRODUCTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLA: PEDIDOS (Órdenes registradas del Checkout por WhatsApp)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE,             -- Número amigable: #101, #102, etc.
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('retiro', 'cadeteria', 'andreani')),
    delivery_address TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('transferencia', 'efectivo')),
    notes TEXT,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'entregado', 'cancelado')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLA: DETALLE DE PEDIDOS (Items del pedido)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    color_name TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) DEFAULT 0
);

-- ==============================================================================
-- 7. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Catálogo: Lectura pública para cualquier visitante
CREATE POLICY "Catálogo público: Categorías" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Catálogo público: Productos activos" ON public.products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Catálogo público: Variantes" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Catálogo público: Imágenes" ON public.product_images FOR SELECT USING (true);

-- Catálogo: Edición exclusiva para Mercedes (Admin autenticado)
CREATE POLICY "Admin CRUD: Categorías" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin CRUD: Productos" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin CRUD: Variantes" ON public.product_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin CRUD: Imágenes" ON public.product_images FOR ALL USING (auth.role() = 'authenticated');

-- Pedidos: Solo Mercedes logueada puede ver y gestionar
CREATE POLICY "Admin pedidos: Ver y gestionar" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin pedido items: Ver y gestionar" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 8. STORAGE: BUCKET PARA FOTOGRAFÍAS DE PRODUCTOS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos públicas para la tienda" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Solo admin sube fotos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Solo admin borra fotos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
