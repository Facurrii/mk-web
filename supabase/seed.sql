-- ==============================================================================
-- DATOS INICIALES: MER KILMURRAY DESIGN
-- ==============================================================================

-- 1. Categorías iniciales
INSERT INTO public.categories (name, slug, description) VALUES
('Costura', 'costura', 'Accesorios y protectores para máquinas y kits de costura.'),
('Trabajo', 'trabajo', 'Fundas y accesorios funcionales para notebook y estudio.'),
('Cotidiano', 'cotidiano', 'Organizadores y porta documentos para la rutina y viajes.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Carga de los 5 productos reales con variantes
DO $$
DECLARE
    cat_costura UUID;
    cat_trabajo UUID;
    cat_cotidiano UUID;
    prod_bolso UUID;
    prod_costurero UUID;
    prod_notebook UUID;
    prod_neceser UUID;
    prod_documento UUID;
BEGIN
    SELECT id INTO cat_costura FROM public.categories WHERE slug = 'costura';
    SELECT id INTO cat_trabajo FROM public.categories WHERE slug = 'trabajo';
    SELECT id INTO cat_cotidiano FROM public.categories WHERE slug = 'cotidiano';

    -- Bolso para máquina de coser ($140.000)
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured)
    VALUES (cat_costura, 'Bolso para máquina de coser', 'bolso-para-maquina-de-coser', 'Diseñado para guardar y trasladar tu máquina de coser de forma práctica y cómoda. Estructurado para protegerla y mantener todo más organizado.', 140000.00, true)
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price
    RETURNING id INTO prod_bolso;

    -- Costurero portátil (Precio a definir)
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured)
    VALUES (cat_costura, 'Costurero portátil', 'costurero-portatil', 'Un pequeño kit de costura para llevar siempre con vos. Ideal para tener a mano lo esencial y resolver esos pequeños arreglos que aparecen en el día a día.', NULL, false)
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO prod_costurero;

    -- Porta notebook ($34.500)
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured)
    VALUES (cat_trabajo, 'Porta notebook', 'porta-notebook', 'Diseñado para transportar y proteger tu notebook de forma práctica. Un complemento funcional para acompañarte en tus jornadas de trabajo o estudio.', 34500.00, true)
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price
    RETURNING id INTO prod_notebook;

    -- Neceser organizador ($27.000)
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured)
    VALUES (cat_cotidiano, 'Neceser organizador', 'neceser-organizador', 'Un básico para guardar y organizar esos objetos que necesitás tener a mano. Práctico y versátil, se adapta a distintos usos.', 27000.00, true)
    ON CONFLICT (slug) DO UPDATE SET base_price = EXCLUDED.base_price
    RETURNING id INTO prod_neceser;

    -- Porta documento (Precio a definir)
    INSERT INTO public.products (category_id, name, slug, description, base_price, is_featured)
    VALUES (cat_cotidiano, 'Porta documento', 'porta-documento', 'Diseñado para guardar y organizar tus documentos de forma práctica. Ideal para tener todo junto y a mano tanto en tu día a día como en viajes.', NULL, false)
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO prod_documento;

    -- Variantes de Color: Gris (#71717A), Bordó (#800020), Verde (#2D5A27)
    IF prod_bolso IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, color_name, color_hex, stock) VALUES
        (prod_bolso, 'Gris', '#71717A', 5),
        (prod_bolso, 'Bordó', '#800020', 3),
        (prod_bolso, 'Verde', '#2D5A27', 4)
        ON CONFLICT DO NOTHING;
    END IF;

    IF prod_costurero IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, color_name, color_hex, stock) VALUES
        (prod_costurero, 'Gris', '#71717A', 10),
        (prod_costurero, 'Bordó', '#800020', 8),
        (prod_costurero, 'Verde', '#2D5A27', 8)
        ON CONFLICT DO NOTHING;
    END IF;

    IF prod_notebook IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, color_name, color_hex, stock) VALUES
        (prod_notebook, 'Gris', '#71717A', 6),
        (prod_notebook, 'Bordó', '#800020', 4),
        (prod_notebook, 'Verde', '#2D5A27', 5)
        ON CONFLICT DO NOTHING;
    END IF;

    IF prod_neceser IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, color_name, color_hex, stock) VALUES
        (prod_neceser, 'Gris', '#71717A', 8),
        (prod_neceser, 'Bordó', '#800020', 6),
        (prod_neceser, 'Verde', '#2D5A27', 7)
        ON CONFLICT DO NOTHING;
    END IF;

    IF prod_documento IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, color_name, color_hex, stock) VALUES
        (prod_documento, 'Gris', '#71717A', 10),
        (prod_documento, 'Bordó', '#800020', 5),
        (prod_documento, 'Verde', '#2D5A27', 5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
