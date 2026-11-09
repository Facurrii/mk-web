-- ==============================================================================
-- 03 — Detalles de producto: medidas y qué incluye
-- ------------------------------------------------------------------------------
-- Texto simple para que se pueda editar fácil desde el admin:
--   measurements: una medida por línea ("Ancho: 46 cm"). Una línea que termina
--                 en ":" abre un grupo nuevo ("Bolsillo exterior:").
--   includes:     un elemento por línea ("1 cinta métrica").
-- Correr este archivo completo en Supabase → SQL Editor.
-- ==============================================================================

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS measurements TEXT,
    ADD COLUMN IF NOT EXISTS includes TEXT;
