"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
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
        <span className="font-script text-2xl text-[#631E2E] block">
          tu pedido
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#631E2E] mt-1">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-[#2A1A1E]/70 font-light">
          No tenés productos agregados para confirmar en este momento.
        </p>
        <Link
          href="/productos"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#631E2E] px-6 py-3.5 text-xs font-semibold text-[#FBF4E8] shadow-md hover:bg-[#47131F] transition"
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#631E2E]/70 hover:text-[#631E2E] mb-8 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Continuar mirando la tienda</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="border-b border-[#631E2E]/10 pb-6 mb-8">
            <span className="font-script text-2xl text-[#631E2E] block">
              paso final
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#631E2E] mt-1">
              Finalizar Pedido
            </h1>
            <p className="mt-1.5 text-xs text-[#2A1A1E]/70 font-light">
              Completá tus datos para coordinar el pedido directamente al WhatsApp de Mercedes.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Datos Personales */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#631E2E]">
                1. Tus Datos de Contacto
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#2A1A1E]/80 mb-1.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Lucía Gómez"
                  className="w-full rounded-xl border border-[#631E2E]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A1A1E] focus:border-[#631E2E] focus:outline-none focus:ring-1 focus:ring-[#631E2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2A1A1E]/80 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 358 1234567"
                  className="w-full rounded-xl border border-[#631E2E]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A1A1E] focus:border-[#631E2E] focus:outline-none focus:ring-1 focus:ring-[#631E2E]"
                />
              </div>
            </div>

            {/* 2. Método de Entrega */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#631E2E]">
                2. Forma de Entrega
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                      deliveryMethod === opt.id
                        ? "border-[#631E2E] bg-[#E2A6BA]/15 ring-1 ring-[#631E2E]"
                        : "border-[#631E2E]/15 bg-white hover:border-[#631E2E]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={opt.id}
                      checked={deliveryMethod === opt.id}
                      onChange={() => setDeliveryMethod(opt.id)}
                      className="mt-1 accent-[#631E2E]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#631E2E] block">
                        {opt.title}
                      </span>
                      <span className="text-xs text-[#2A1A1E]/70 block mt-0.5 font-light">
                        {opt.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {deliveryMethod !== "retiro" && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-[#2A1A1E]/80 mb-1.5">
                    Dirección completa, Localidad y Código Postal *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ej: Calle San Martín 450, Barrio Centro, Río Cuarto (CP 5800)"
                    className="w-full rounded-xl border border-[#631E2E]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A1A1E] focus:border-[#631E2E] focus:outline-none focus:ring-1 focus:ring-[#631E2E]"
                  />
                </div>
              )}
            </div>

            {/* 3. Método de Pago */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#631E2E]">
                3. Medio de Pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((pay) => (
                  <label
                    key={pay.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                      paymentMethod === pay.id
                        ? "border-[#631E2E] bg-[#E2A6BA]/15 ring-1 ring-[#631E2E]"
                        : "border-[#631E2E]/15 bg-white hover:border-[#631E2E]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pay.id}
                      checked={paymentMethod === pay.id}
                      onChange={() => setPaymentMethod(pay.id)}
                      className="mt-1 accent-[#631E2E]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#631E2E] block">
                        {pay.title}
                      </span>
                      <span className="text-xs text-[#2A1A1E]/70 block mt-0.5 font-light">
                        {pay.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Notas */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#2A1A1E]/80">
                Notas adicionales o comentarios para Mercedes (opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Es para un regalo, ¿podrían envolverlo?"
                className="w-full rounded-xl border border-[#631E2E]/20 bg-white px-3.5 py-2.5 text-sm text-[#2A1A1E] focus:border-[#631E2E] focus:outline-none focus:ring-1 focus:ring-[#631E2E]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#631E2E] px-6 py-4 text-sm font-semibold text-[#FBF4E8] shadow-md hover:bg-[#47131F] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="h-5 w-5 fill-[#FBF4E8] text-[#631E2E]" />
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
          <div className="sticky top-28 rounded-3xl border border-[#631E2E]/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-medium text-[#631E2E] border-b border-[#631E2E]/10 pb-4">
              Resumen del Pedido ({items.length} {items.length === 1 ? "ítem" : "ítems"})
            </h2>

            {/* Items list */}
            <div className="divide-y divide-[#631E2E]/10 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-[#2A1A1E]">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.colorName && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#2A1A1E]/60">
                        {item.colorHex && (
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        )}
                        <span>Color: {item.colorName}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-[#631E2E] shrink-0">
                    {item.price ? formatPrice(item.price * item.quantity) : "A consultar"}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[#631E2E]/10 pt-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[#2A1A1E]/70 font-light">Total estimado:</span>
                <span className="text-2xl font-semibold text-[#631E2E]">
                  {totalPrice > 0 ? formatPrice(totalPrice) : "A consultar"}
                </span>
              </div>
              <p className="text-[11px] text-[#2A1A1E]/50 font-light leading-tight">
                Los costos de envío por cadetería o Andreani se confirman vía WhatsApp al coordinar la entrega.
              </p>
            </div>

            {/* Trust badge */}
            <div className="rounded-2xl bg-[#FBF4E8] p-4 border border-[#631E2E]/10 flex items-start gap-3 text-xs text-[#2A1A1E]/80">
              <ShieldCheck className="h-5 w-5 text-[#B4AF3B] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#631E2E] block">
                  Trato directo y personalizado
                </span>
                <span className="font-light">
                  Al tocar el botón, se abrirá WhatsApp con el pedido listo. Hablás directamente con Mercedes sin intermediarios.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
