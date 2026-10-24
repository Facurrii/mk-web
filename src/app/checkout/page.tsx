"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { DELIVERY_OPTIONS, PAYMENT_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { DeliveryMethod, PaymentMethod } from "@/types/database";
import { generateWhatsAppMessage } from "@/lib/whatsapp";
import { createOrderAction } from "@/actions/orders";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("retiro");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim()) {
      setErrorMsg("Por favor, ingresá tu nombre completo.");
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg("Por favor, ingresá un número de teléfono o WhatsApp.");
      return;
    }

    if (deliveryMethod !== "retiro" && !deliveryAddress.trim()) {
      setErrorMsg("Por favor, indicá tu dirección de entrega y localidad.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Guardar la orden en Supabase usando el Server Action con Service Role
      const result = await createOrderAction({
        customerName,
        customerPhone,
        deliveryMethod,
        deliveryAddress: deliveryAddress || undefined,
        paymentMethod,
        notes: notes || undefined,
        items,
        totalAmount: totalPrice,
      });

      if (!result.success && result.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }

      // 2. Generar el enlace preformateado de WhatsApp
      const whatsappUrl = generateWhatsAppMessage({
        orderNumber: result.orderNumber,
        items,
        formData: {
          customerName,
          customerPhone,
          deliveryMethod,
          deliveryAddress,
          paymentMethod,
          notes,
        },
        total: totalPrice,
      });

      // 3. Limpiar carrito
      clearCart();

      // 4. Redirigir a WhatsApp
      window.location.href = whatsappUrl;
    } catch (err) {
      console.error(err);
      // Fallback directo a WhatsApp si surge cualquier imprevisto
      const fallbackUrl = generateWhatsAppMessage({
        items,
        formData: {
          customerName,
          customerPhone,
          deliveryMethod,
          deliveryAddress,
          paymentMethod,
          notes,
        },
        total: totalPrice,
      });
      clearCart();
      window.location.href = fallbackUrl;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium text-stone-900">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          No tenés productos agregados para confirmar.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link
        href="/productos"
        className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 mb-8 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Continuar comprando</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="border-b border-stone-200 pb-6 mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
              Finalizar Pedido
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Completá tus datos para generar el pedido y enviarlo directamente al WhatsApp de Mercedes.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Datos Personales */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                1. Tus Datos de Contacto
              </h2>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Lucía Gómez"
                  className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 358 1234567"
                  className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* 2. Método de Entrega */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                2. Forma de Entrega
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition ${
                      deliveryMethod === opt.id
                        ? "border-stone-900 bg-stone-100/60 ring-1 ring-stone-900"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={opt.id}
                      checked={deliveryMethod === opt.id}
                      onChange={() => setDeliveryMethod(opt.id)}
                      className="mt-1 accent-stone-900"
                    />
                    <div>
                      <span className="text-sm font-medium text-stone-900 block">
                        {opt.title}
                      </span>
                      <span className="text-xs text-stone-500 block mt-0.5">
                        {opt.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {deliveryMethod !== "retiro" && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Dirección completa, Localidad y Código Postal *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ej: Calle San Martín 450, Barrio Centro, Río Cuarto (CP 5800)"
                    className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              )}
            </div>

            {/* 3. Método de Pago */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                3. Medio de Pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((pay) => (
                  <label
                    key={pay.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition ${
                      paymentMethod === pay.id
                        ? "border-stone-900 bg-stone-100/60 ring-1 ring-stone-900"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pay.id}
                      checked={paymentMethod === pay.id}
                      onChange={() => setPaymentMethod(pay.id)}
                      className="mt-1 accent-stone-900"
                    />
                    <div>
                      <span className="text-sm font-medium text-stone-900 block">
                        {pay.title}
                      </span>
                      <span className="text-xs text-stone-500 block mt-0.5">
                        {pay.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Notas */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-700">
                Notas adicionales o comentarios para Mercedes (opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Es para un regalo, ¿lo pueden envolver?"
                className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
              <span>
                {isSubmitting
                  ? "Procesando pedido..."
                  : "Confirmar y Enviar Pedido por WhatsApp"}
              </span>
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
            <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-200 pb-4">
              Resumen del Pedido ({items.length} {items.length === 1 ? "ítem" : "ítems"})
            </h2>

            {/* Items list */}
            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-stone-900">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.colorName && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500">
                        {item.colorHex && (
                          <span
                            className="h-2 w-2 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        )}
                        <span>Color: {item.colorName}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-stone-800 shrink-0">
                    {item.price ? formatPrice(item.price * item.quantity) : "A consultar"}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-stone-200 pt-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-stone-600">Total estimado:</span>
                <span className="text-2xl font-semibold text-stone-900">
                  {totalPrice > 0 ? formatPrice(totalPrice) : "A consultar"}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Los costos de envío por cadetería o Andreani se confirman vía WhatsApp al coordinar la entrega.
              </p>
            </div>

            {/* Trust badge */}
            <div className="rounded-lg bg-stone-50 p-4 border border-stone-200/80 flex items-start gap-3 text-xs text-stone-600">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-stone-900 block">
                  Trato directo y personalizado
                </span>
                <span>
                  Al tocar el botón verde, se abrirá WhatsApp con el mensaje listo. Hablás directamente con Mercedes sin intermediarios.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
