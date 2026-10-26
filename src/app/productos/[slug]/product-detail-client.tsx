"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Truck,
  Shield,
  MessageCircle,
  Ban,
  AlertCircle,
} from "lucide-react";
import { Product, ProductVariant } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { COLOR_PALETTE, STORE_INFO } from "@/lib/constants";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();

  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : COLOR_PALETTE.map((c, i) => ({
          id: `default-var-${i}`,
          product_id: product.id,
          color_name: c.name,
          color_hex: c.hex,
          stock: 5,
          sku: null,
          created_at: "",
        }));

  const initialVariant = variants.find((v) => (v.stock ?? 0) > 0) || variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const currentStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      price: product.base_price,
      variantId: selectedVariant?.id,
      colorName: selectedVariant?.color_name,
      colorHex: selectedVariant?.color_hex || undefined,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productWhatsappLink = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    `¡Hola Mercedes! Te escribo con una consulta sobre el producto "${product.name}" (Color: ${
      selectedVariant?.color_name || "Gris"
    }${isOutOfStock ? " - figura sin stock" : ""}).`
  )}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* Product Image Stage */}
      <div className="space-y-4">
        <div className="aspect-square w-full rounded-3xl bg-white border border-[#631E2E]/10 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-sm">
          <ShoppingBag className="h-32 w-32 text-[#631E2E]/20 stroke-[1]" />
          <span className="font-serif text-lg font-medium text-[#631E2E] mt-4 uppercase tracking-wider">
            {product.name}
          </span>
          <span className="font-script text-xl text-[#B4AF3B] mt-1 lowercase">
            color: {selectedVariant?.color_name}
          </span>

          {/* Color pill indicator */}
          {selectedVariant?.color_hex && (
            <div className="absolute top-5 right-5 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 shadow-sm border border-[#631E2E]/10">
              <span
                className="h-3.5 w-3.5 rounded-full border border-stone-300"
                style={{ backgroundColor: selectedVariant.color_hex }}
              />
              <span className="text-xs font-semibold text-[#2A1A1E]">
                {selectedVariant.color_name}
              </span>
              {isOutOfStock && (
                <span className="text-[10px] font-semibold text-rose-600 ml-1">
                  (Agotado)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details & Actions */}
      <div className="space-y-7">
        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B4AF3B]">
              Colección {product.category.name}
            </span>
          )}
          <h1 className="mt-1 font-serif text-3xl sm:text-5xl font-medium text-[#631E2E] leading-tight">
            {product.name}
          </h1>
          <div className="mt-4 text-3xl font-semibold text-[#631E2E]">
            {formatPrice(product.base_price)}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-b border-[#631E2E]/10 py-6 text-[#2A1A1E]/80 text-sm sm:text-base leading-relaxed font-light">
          {product.description}
        </div>

        {/* Color Variants con indicación de stock */}
        {variants.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#631E2E] block">
                Color seleccionado:{" "}
                <span className="text-[#2A1A1E] font-bold">{selectedVariant?.color_name}</span>
              </label>

              {/* Indicador de stock para la variante elegida */}
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                  Sin stock en este color
                </span>
              ) : currentStock <= 3 ? (
                <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  ¡Últimas {currentStock} unidades!
                </span>
              ) : (
                <span className="text-xs text-[#2A1A1E]/60">
                  {currentStock} unidades disponibles
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {variants.map((v) => {
                const isSelected = selectedVariant?.color_name === v.color_name;
                const vOutOfStock = (v.stock ?? 0) <= 0;

                return (
                  <button
                    key={v.id || v.color_name}
                    type="button"
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-[#631E2E] bg-[#631E2E] text-[#FBF4E8] shadow-sm ring-2 ring-[#631E2E]/20"
                        : "border-[#631E2E]/15 bg-white text-[#2A1A1E] hover:border-[#631E2E]"
                    } ${vOutOfStock ? "opacity-60" : ""}`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-stone-300"
                      style={{ backgroundColor: v.color_hex || "#888" }}
                    />
                    <span>{v.color_name}</span>
                    {vOutOfStock && (
                      <span className={`text-[10px] ${isSelected ? "text-stone-300" : "text-rose-600"}`}>
                        (Agotado)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje de alerta si el color está agotado */}
        {isOutOfStock && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Color sin stock disponible:</span> El color{" "}
              <strong>{selectedVariant?.color_name}</strong> se encuentra agotado momentáneamente.
              Podés elegir otro color disponible o escribirle a Mercedes por WhatsApp para coordinar encargo.
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            {/* Quantity box */}
            <div className="flex items-center rounded-xl border border-[#631E2E]/20 bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3.5 text-[#631E2E] hover:bg-[#FBF4E8] transition disabled:opacity-30"
                aria-label="Restar una unidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-[#2A1A1E]">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= currentStock}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="p-3.5 text-[#631E2E] hover:bg-[#FBF4E8] transition disabled:opacity-30"
                aria-label="Sumar una unidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add button */}
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 px-6 text-sm font-semibold bg-[#FBF4E8] text-stone-400 cursor-not-allowed border border-stone-200"
              >
                <Ban className="h-4 w-4 text-rose-500" />
                <span>Agotado en {selectedVariant?.color_name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 px-6 text-sm font-semibold transition-all shadow-md active:scale-95 ${
                  added
                    ? "bg-[#B4AF3B] text-white"
                    : "bg-[#631E2E] text-[#FBF4E8] hover:bg-[#47131F] hover:shadow-lg"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>¡Agregado al carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>Agregar al pedido</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick WhatsApp Inquiry */}
          <a
            href={productWhatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#631E2E]/25 bg-white py-3.5 text-xs font-semibold text-[#631E2E] hover:bg-[#FBF4E8] hover:border-[#631E2E] transition"
          >
            <MessageCircle className="h-4 w-4" />
            <span>
              {isOutOfStock
                ? "Consultar a Mercedes cuándo vuelve a ingresar este color"
                : "Consultar directamente por este producto"}
            </span>
          </a>
        </div>

        {/* Trust & Shipping info */}
        <div className="rounded-2xl bg-white p-6 space-y-3.5 text-xs text-[#2A1A1E]/80 mt-6 border border-[#631E2E]/10 shadow-2xs">
          <div className="flex items-center gap-2 font-serif font-medium text-sm text-[#631E2E]">
            <Truck className="h-4 w-4 text-[#B4AF3B]" />
            <span>Formas de entrega disponibles:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-[#2A1A1E]/70 pl-1 font-light">
            <li>Retiro sin cargo por domicilio (Río Cuarto).</li>
            <li>Cadetería local directa dentro de la ciudad.</li>
            <li>Envíos a todo el país vía Andreani.</li>
          </ul>

          <div className="flex items-center gap-2 font-serif font-medium text-sm text-[#631E2E] pt-3 border-t border-[#631E2E]/10">
            <Shield className="h-4 w-4 text-[#B3C1CC]" />
            <span>Pagos seguros por Transferencia o Efectivo al retirar.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
