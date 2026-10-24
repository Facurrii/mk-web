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
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-stone-800" />
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Tu Carrito
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-stone-200">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="p-4 rounded-full bg-stone-100 text-stone-400 mb-4">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-medium text-stone-800">
                  El carrito está vacío
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Explorá nuestras colecciones de costura, trabajo y cotidiano para agregar piezas a tu pedido.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 text-sm font-medium text-stone-900 underline hover:text-stone-600 transition"
                >
                  Continuar explorando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  {/* Color box / Thumbnail */}
                  <div className="h-16 w-16 rounded-md bg-stone-200 flex items-center justify-center shrink-0 border border-stone-300">
                    {item.colorHex ? (
                      <span
                        className="h-6 w-6 rounded-full shadow-inner border border-stone-400"
                        style={{ backgroundColor: item.colorHex }}
                        title={item.colorName}
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-stone-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-stone-900 truncate">
                      {item.productName}
                    </h4>

                    {item.colorName && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        Color: <span className="font-medium text-stone-700">{item.colorName}</span>
                      </p>
                    )}

                    <div className="text-xs font-semibold text-stone-900 mt-1">
                      {item.price ? formatPrice(item.price) : "A consultar"}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-stone-300 rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 transition"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition p-1"
                        aria-label="Eliminar item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 px-6 py-5 bg-white space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Subtotal estimado</span>
                <span className="font-semibold text-stone-900 text-base">
                  {totalPrice > 0 ? formatPrice(totalPrice) : "A consultar"}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                El envío y la forma de pago (transferencia o efectivo) se coordinan en el siguiente paso vía WhatsApp.
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800 transition shadow-sm"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
