"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, ShoppingBag, Ban } from "lucide-react";
import { Product, ProductVariant } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { COLOR_PALETTE } from "@/lib/constants";

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

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(variants[0]);
  const [justAdded, setJustAdded] = useState(false);

  const isCurrentVariantOutOfStock = (selectedVariant?.stock ?? 0) <= 0;
  const isEntireProductOutOfStock = variants.every((v) => (v.stock ?? 0) <= 0);

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
    <div className="group relative flex flex-col rounded-lg border border-stone-200/80 bg-white p-4 transition-all duration-300 hover:border-stone-300 hover:shadow-md">
      {/* Product Image */}
      <Link
        href={`/productos/${product.slug}`}
        className="block overflow-hidden rounded-md bg-stone-100 aspect-square relative"
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 group-hover:scale-105 transition-transform duration-500">
          <ShoppingBag className="h-12 w-12 stroke-[1.2] text-stone-400" />
          <span className="text-[11px] tracking-wider uppercase mt-2 text-stone-500 font-medium">
            {selectedVariant ? selectedVariant.color_name : "Diseño Textil"}
          </span>
        </div>

        {/* Badge de Agotado en la imagen si el producto completo no tiene stock */}
        {isEntireProductOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-900 shadow">
              Agotado
            </span>
          </div>
        )}

        {/* Selected Color Chip badge */}
        {selectedVariant?.color_hex && !isEntireProductOutOfStock && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-xs px-2 py-1 shadow-xs border border-stone-200 text-[11px] text-stone-700">
            <span
              className="h-2.5 w-2.5 rounded-full border border-stone-300"
              style={{ backgroundColor: selectedVariant.color_hex }}
            />
            <span>{selectedVariant.color_name}</span>
            {isCurrentVariantOutOfStock && (
              <span className="text-[9px] font-semibold text-rose-600 ml-0.5">
                (Agotado)
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Category */}
          {product.category?.name && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
              {product.category.name}
            </span>
          )}

          {/* Title */}
          <h3 className="mt-1 text-base font-medium text-stone-900 group-hover:text-stone-700 transition">
            <Link href={`/productos/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Short description */}
          {product.description && (
            <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Color variants selector & Price */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          {/* Color dots */}
          {variants.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] text-stone-400 mr-1">Color:</span>
              {variants.map((v) => {
                const isOutOfStock = (v.stock ?? 0) <= 0;
                return (
                  <button
                    key={v.id || v.color_name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`h-5 w-5 rounded-full border transition-all relative ${
                      selectedVariant?.color_name === v.color_name
                        ? "ring-2 ring-stone-900 ring-offset-1 scale-110"
                        : "border-stone-300 hover:scale-105"
                    } ${isOutOfStock ? "opacity-40" : ""}`}
                    style={{ backgroundColor: v.color_hex || "#888" }}
                    title={`${v.color_name} ${isOutOfStock ? "(Agotado)" : `(${v.stock} unid.)`}`}
                    aria-label={`Seleccionar color ${v.color_name}`}
                  >
                    {isOutOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block font-light">Precio</span>
              <span className="text-base font-semibold text-stone-900">
                {formatPrice(product.base_price)}
              </span>
            </div>

            {/* Botón con estado de stock */}
            {isCurrentVariantOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex items-center gap-1 rounded-md bg-stone-100 px-3 py-2 text-xs font-medium text-stone-400 cursor-not-allowed border border-stone-200"
                title="Color sin stock"
              >
                <Ban className="h-3.5 w-3.5 text-rose-500" />
                <span>Agotado</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  justAdded
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
                title="Agregar al carrito"
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>¡Agregado!</span>
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
