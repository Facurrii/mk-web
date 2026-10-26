"use client";

import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartSheet() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotalPrice } =
    useCartStore();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#631E2E]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#FBF4E8] shadow-2xl flex flex-col border-l border-[#631E2E]/15">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#631E2E]/10 bg-white/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#631E2E]" />
              <h2 className="text-xl font-serif font-medium text-[#631E2E]">
                Tu Carrito
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-[#631E2E] hover:bg-[#FBF4E8] transition"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#631E2E]/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="p-5 rounded-full bg-white text-[#631E2E]/40 mb-4 border border-[#631E2E]/10">
                  <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
                </div>
                <h3 className="text-base font-serif font-medium text-[#631E2E]">
                  El carrito está vacío
                </h3>
                <p className="text-xs text-[#2A1A1E]/60 mt-1 max-w-xs font-light">
                  Explorá nuestras colecciones de costura, trabajo y cotidiano para agregar piezas a tu pedido.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 text-xs font-semibold text-[#631E2E] underline hover:text-[#47131F] transition"
                >
                  Continuar explorando la tienda
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  {/* Color box / Thumbnail */}
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#631E2E]/10 shadow-2xs">
                    {item.colorHex ? (
                      <span
                        className="h-6 w-6 rounded-full shadow-inner border border-stone-300"
                        style={{ backgroundColor: item.colorHex }}
                        title={item.colorName}
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-[#631E2E]/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-medium text-sm text-[#631E2E] truncate">
                      {item.productName}
                    </h4>

                    {item.colorName && (
                      <span className="text-xs text-[#2A1A1E]/60 block font-light">
                        Color: <strong className="font-medium text-[#2A1A1E]">{item.colorName}</strong>
                      </span>
                    )}

                    <div className="mt-2 text-xs font-semibold text-[#631E2E]">
                      {item.price ? formatPrice(item.price) : "A consultar"}
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-[#631E2E]/20 bg-white shadow-2xs overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:bg-[#FBF4E8] transition"
                          aria-label="Restar una unidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#2A1A1E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-stone-600 hover:bg-[#FBF4E8] transition"
                          aria-label="Sumar una unidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                        title="Eliminar del pedido"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer action */}
          {items.length > 0 && (
            <div className="border-t border-[#631E2E]/10 bg-white/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2A1A1E]/70 font-light">Subtotal estimado:</span>
                <span className="text-xl font-semibold text-[#631E2E]">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <p className="text-[11px] text-[#2A1A1E]/60 font-light leading-tight">
                El costo de envío y la coordinación del pago se confirman directamente con Mercedes por WhatsApp.
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#631E2E] py-3.5 px-4 text-xs font-semibold text-[#FBF4E8] shadow-md hover:bg-[#47131F] transition active:scale-95"
              >
                <span>Continuar al Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
