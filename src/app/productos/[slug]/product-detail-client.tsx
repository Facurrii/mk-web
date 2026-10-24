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

  // Intentar seleccionar por defecto el primer color que tenga stock disponible
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
        <div className="aspect-square w-full rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
          <ShoppingBag className="h-28 w-28 text-stone-300 stroke-[1]" />
          <span className="text-sm font-medium text-stone-600 mt-4 uppercase tracking-wider">
            {product.name}
          </span>
          <span className="text-xs text-stone-400 mt-1">
            Color: {selectedVariant?.color_name}
          </span>

          {/* Color pill indicator */}
          {selectedVariant?.color_hex && (
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-xs border border-stone-200">
              <span
                className="h-3.5 w-3.5 rounded-full border border-stone-300"
                style={{ backgroundColor: selectedVariant.color_hex }}
              />
              <span className="text-xs font-medium text-stone-700">
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
      <div className="space-y-6">
        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Colección {product.category.name}
            </span>
          )}
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-medium text-stone-900 leading-tight">
            {product.name}
          </h1>
          <div className="mt-4 text-2xl font-semibold text-stone-900">
            {formatPrice(product.base_price)}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-b border-stone-200 py-6 text-stone-600 text-sm leading-relaxed">
          {product.description}
        </div>

        {/* Color Variants con indicación de stock */}
        {variants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                Color seleccionado:{" "}
                <span className="text-stone-900 font-bold">{selectedVariant?.color_name}</span>
              </label>

              {/* Indicador de stock para la variante elegida */}
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  Sin stock en este color
                </span>
              ) : currentStock <= 3 ? (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ¡Últimas {currentStock} unidades!
                </span>
              ) : (
                <span className="text-xs text-stone-500">
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
                      setQuantity(1); // Resetear cantidad a 1 al cambiar de variante
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
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
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-800">
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
            <div className="flex items-center rounded-xl border border-stone-300 bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-stone-600 hover:text-stone-900 transition disabled:opacity-30 disabled:hover:text-stone-600"
                aria-label="Restar una unidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-stone-900">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= currentStock}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="p-3 text-stone-600 hover:text-stone-900 transition disabled:opacity-30 disabled:hover:text-stone-600"
                aria-label="Sumar una unidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add button - Deshabilitado cuando el color tiene stock 0 */}
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-semibold bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300"
              >
                <Ban className="h-4 w-4 text-rose-500" />
                <span>Agotado en {selectedVariant?.color_name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-semibold transition-all shadow-sm ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-900 text-white hover:bg-stone-800 active:scale-95"
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
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 transition"
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
        <div className="rounded-xl bg-stone-100 p-5 space-y-3 text-xs text-stone-600 mt-6">
          <div className="flex items-center gap-2 font-medium text-stone-900">
            <Truck className="h-4 w-4 text-stone-700" />
            <span>Formas de entrega disponibles:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
            <li>Retiro sin cargo por domicilio (Río Cuarto).</li>
            <li>Cadetería local directa.</li>
            <li>Envíos a todo el país vía Andreani.</li>
          </ul>

          <div className="flex items-center gap-2 font-medium text-stone-900 pt-2 border-t border-stone-200">
            <Shield className="h-4 w-4 text-stone-700" />
            <span>Pagos seguros por Transferencia o Efectivo al retirar.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
