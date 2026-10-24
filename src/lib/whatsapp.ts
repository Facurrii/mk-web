import { CartItem, CheckoutFormData } from "@/types/cart";
import { formatPrice } from "./utils";
import { DELIVERY_OPTIONS, PAYMENT_OPTIONS, STORE_INFO } from "./constants";

interface GenerateWhatsAppMessageProps {
  orderNumber?: number;
  items: CartItem[];
  formData: CheckoutFormData;
  total: number;
}

export function generateWhatsAppMessage({
  orderNumber,
  items,
  formData,
  total,
}: GenerateWhatsAppMessageProps): string {
  const delivery = DELIVERY_OPTIONS.find((d) => d.id === formData.deliveryMethod);
  const payment = PAYMENT_OPTIONS.find((p) => p.id === formData.paymentMethod);

  const header = orderNumber
    ? `🌿 *PEDIDO #${orderNumber} - ${STORE_INFO.name}*`
    : `🌿 *NUEVO PEDIDO - ${STORE_INFO.name}*`;

  const itemsList = items
    .map((item) => {
      const colorText = item.colorName ? ` (Color: ${item.colorName})` : "";
      const priceText = item.price ? formatPrice(item.price * item.quantity) : "A consultar";
      return `• ${item.quantity}x ${item.productName}${colorText} — ${priceText}`;
    })
    .join("\n");

  const deliveryText =
    formData.deliveryMethod === "retiro"
      ? `• *Entrega:* ${delivery?.title}`
      : `• *Entrega:* ${delivery?.title} (${formData.deliveryAddress || "Sin dirección indicada"})`;

  const paymentText = `• *Medio de pago:* ${payment?.title}`;

  const customerText = `• *Cliente:* ${formData.customerName} (${formData.customerPhone})`;

  const notesText = formData.notes?.trim() ? `• *Notas:* ${formData.notes}` : "";

  const totalText = total > 0 ? `💰 *Total estimado:* ${formatPrice(total)}` : "💰 *Total:* A consultar";

  const message = [
    header,
    "",
    "¡Hola Mercedes! Quiero confirmar el siguiente pedido desde la web:",
    "",
    itemsList,
    "",
    totalText,
    "",
    "📋 *Datos de la compra:*",
    customerText,
    deliveryText,
    paymentText,
    notesText,
    "",
    "¿Me confirmás la disponibilidad y cómo coordinamos el pago? ¡Muchas gracias!",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
