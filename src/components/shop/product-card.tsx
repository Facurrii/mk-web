"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, ShoppingBag, Ban } from "lucide-react";
import { Product, ProductVariant } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { COLOR_PALETTE } from "@/lib/constants";
import { getImagesForVariant, pickDefaultVariant } from "@/lib/product-images";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : COLOR_PALETTE.map((c, i) => ({
          id: `mock-var-${i}`,
          product_id: product.id,
          color_name: c.name,
          color_hex: c.hex,
          stock: 5,
          sku: null,
          created_at: "",
        }));

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => pickDefaultVariant(product, variants));
  const [justAdded, setJustAdded] = useState(false);

  const isCurrentVariantOutOfStock = (selectedVariant?.stock ?? 0) <= 0;
  const isEntireProductOutOfStock = variants.every((v) => (v.stock ?? 0) <= 0);
  const cover = getImagesForVariant(product, selectedVariant?.id)[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrentVariantOutOfStock) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      price: product.base_price,
      variantId: selectedVariant?.id,
      colorName: selectedVariant?.color_name,
      colorHex: selectedVariant?.color_hex || undefined,
      quantity: 1,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#631E2E]/10 bg-white p-2.5 sm:p-5 transition-all duration-300 hover:border-[#E2A6BA] hover:shadow-xl">
      {/* Product Image */}
      <Link
        href={`/productos/${product.slug}`}
        className="block overflow-hidden rounded-xl bg-[#FBF4E8] aspect-[3/4] relative border border-[#631E2E]/5"
      >
        {cover ? (
          <Image
            src={cover.image_url}
            alt={`${product.name}${selectedVariant ? ` color ${selectedVariant.color_name}` : ""}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#631E2E]/30 group-hover:scale-105 transition-transform duration-500">
            <ShoppingBag className="h-14 w-14 stroke-[1.1]" />
            <span className="font-script text-base mt-2 text-[#631E2E]/60">
              {selectedVariant ? selectedVariant.color_name : "diseño textil"}
            </span>
          </div>
        )}

        {/* Badge de Agotado en la imagen */}
        {isEntireProductOutOfStock && (
          <div className="absolute inset-0 bg-[#631E2E]/40 backdrop-blur-2xs flex items-center justify-center">
            <span className="rounded-full bg-[#FBF4E8] px-2.5 py-0.5 text-[10px] sm:px-3.5 sm:py-1 sm:text-xs font-semibold text-[#631E2E] shadow-md">
              Agotado
            </span>
          </div>
        )}

        {/* Selected Color Chip badge */}
        {selectedVariant?.color_hex && !isEntireProductOutOfStock && (
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 shadow-2xs border border-[#631E2E]/10 text-[11px] text-[#2A1A1E]">
            <span
              className="h-2.5 w-2.5 rounded-full border border-stone-300"
              style={{ backgroundColor: selectedVariant.color_hex }}
            />
            <span className="font-medium">{selectedVariant.color_name}</span>
            {isCurrentVariantOutOfStock && (
              <span className="text-[9px] font-semibold text-rose-600 ml-0.5">
                (Agotado)
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 sm:mt-5 flex flex-1 flex-col justify-between">
        <div>
          {/* Category */}
          {product.category?.name && (
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider sm:tracking-widest text-[#B4AF3B]">
              Colección {product.category.name}
            </span>
          )}

          {/* Title */}
          <h3 className="mt-1 text-sm leading-snug sm:text-lg sm:leading-normal font-serif font-medium text-[#631E2E] group-hover:text-[#47131F] transition">
            <Link href={`/productos/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Short description */}
          {product.description && (
            <p className="mt-1.5 hidden sm:block text-xs text-[#2A1A1E]/65 line-clamp-2 leading-relaxed font-light">
              {product.description}
            </p>
          )}
        </div>

        {/* Color variants selector & Price */}
        <div className="mt-3 pt-2.5 sm:mt-5 sm:pt-3.5 border-t border-[#631E2E]/10">
          {/* Color dots */}
          {variants.length > 0 && (
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3.5">
              <span className="hidden sm:inline text-[11px] text-[#2A1A1E]/50 mr-0.5">Color:</span>
              {variants.map((v) => {
                const isOutOfStock = (v.stock ?? 0) <= 0;
                return (
                  <button
                    key={v.id || v.color_name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`h-5 w-5 rounded-full border transition-all relative ${
                      selectedVariant?.color_name === v.color_name
                        ? "ring-2 ring-[#631E2E] ring-offset-2 scale-110"
                        : "border-stone-300 hover:scale-105"
                    } ${isOutOfStock ? "opacity-35" : ""}`}
                    style={{ backgroundColor: v.color_hex || "#888" }}
                    title={`${v.color_name} ${isOutOfStock ? "(Agotado)" : `(${v.stock} unid.)`}`}
                    aria-label={`Seleccionar color ${v.color_name}`}
                  >
                    {isOutOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="hidden sm:block text-[10px] text-[#2A1A1E]/50 uppercase tracking-wider">
                Precio
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#631E2E]">
                {formatPrice(product.base_price)}
              </span>
            </div>

            {/* Botón con estado de stock */}
            {isCurrentVariantOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-1 rounded-xl bg-[#FBF4E8] px-3.5 py-2 text-xs font-semibold text-stone-400 cursor-not-allowed border border-stone-200"
                title="Color sin stock"
              >
                <Ban className="h-3.5 w-3.5 text-rose-500" />
                <span>Agotado</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                  justAdded
                    ? "bg-[#B4AF3B] text-white"
                    : "bg-[#631E2E] text-[#FBF4E8] hover:bg-[#47131F]"
                }`}
                title="Agregar al carrito"
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
