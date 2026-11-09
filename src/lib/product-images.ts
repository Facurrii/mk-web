import { Product, ProductImage } from "@/types/database";

/**
 * Fotos a mostrar para el color elegido, en orden:
 * 1. Las fotos de ese color.
 * 2. Las fotos generales (sin color asignado).
 * Si el color no tiene fotos propias ni hay generales, devuelve todas
 * (mejor mostrar otra foto del producto que el ícono vacío).
 */
export function getImagesForVariant(product: Product, variantId?: string | null): ProductImage[] {
  const all = [...(product.images ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  if (all.length === 0) return [];

  const own = variantId ? all.filter((img) => img.variant_id === variantId) : [];
  const general = all.filter((img) => !img.variant_id);
  const result = [...own, ...general];

  return result.length > 0 ? result : all;
}

/** Foto principal del producto (para compartir en redes / Open Graph). */
export function getPrimaryImageUrl(product: Product): string | null {
  const all = product.images ?? [];
  return (
    all.find((img) => img.is_primary)?.image_url ??
    [...all].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]?.image_url ??
    null
  );
}
