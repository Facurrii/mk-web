import { CartItem, CheckoutFormData } from "@/types/cart";
import { formatPrice } from "./utils";
import { DELIVERY_OPTIONS, PAYMENT_OPTIONS, STORE_INFO } from "./constants";

interface GenerateWhatsAppMessageProps {
  orderNumber?: number;
  items: CartItem[];
  formData: CheckoutFormData;
  total: number;
}

/*
 * Emojis del mensaje (elegidos por Mer).
 * Nota: 🪡 y 🤍 son emojis "nuevos" (fuera del rango básico de Unicode). Con el
 * link viejo de wa.me, WhatsApp Web/escritorio los mostraba como "�"; con
 * api.whatsapp.com/send deberían verse bien. Si en la compu vuelven a salir "�",
 * cambiar por alternativas del rango básico: ✂️ en vez de 🪡 y ♡ en vez de 🤍.
 */
const SYMBOLS = {
  brand: "\u{1FAA1}✨", // 🪡✨
  item: "\u{1F90D}", // 🤍
  sparkle: "✨", // ✨
};

export function buildWhatsAppText({
  items,
  formData,
  total,
}: GenerateWhatsAppMessageProps): string {
  const delivery = DELIVERY_OPTIONS.find((d) => d.id === formData.deliveryMethod);
  const payment = PAYMENT_OPTIONS.find((p) => p.id === formData.paymentMethod);
  const isPickup = formData.deliveryMethod === "retiro";

  const lines: string[] = [];

  // Sin número de pedido: es interno de Mer (lo ve en el admin), no se le muestra al cliente.
  lines.push(`${SYMBOLS.brand}*NUEVO PEDIDO*`);
  lines.push(`_${STORE_INFO.name}_`);
  lines.push("");
  lines.push(`¡Hola ${STORE_INFO.owner}! Quiero hacer este pedido desde la web:`);
  lines.push("");

  lines.push("*Productos*");
  for (const item of items) {
    const color = item.colorName ? ` · ${item.colorName}` : "";
    const price = item.price ? formatPrice(item.price * item.quantity) : "a consultar";
    lines.push(`${SYMBOLS.item} ${item.quantity} × ${item.productName}${color} — ${price}`);
  }
  lines.push("");

  const hasPriceOnRequest = items.some((i) => !i.price);
  if (total > 0) {
    lines.push(`*Total: ${formatPrice(total)}*${hasPriceOnRequest ? " _(+ productos a consultar)_" : ""}`);
  } else {
    lines.push("*Total: a consultar*");
  }
  if (!isPickup) lines.push("_El costo de envío lo coordinamos por acá._");
  lines.push("");

  lines.push("*Mis datos*");
  lines.push(`${SYMBOLS.item} Nombre: ${formData.customerName.trim()}`);
  lines.push(`${SYMBOLS.item} Teléfono: ${formData.customerPhone.trim()}`);
  lines.push(`${SYMBOLS.item} Entrega: ${delivery?.title ?? formData.deliveryMethod}`);
  if (!isPickup && formData.deliveryAddress?.trim()) {
    lines.push(`${SYMBOLS.item} Dirección: ${formData.deliveryAddress.trim()}`);
  }
  lines.push(`${SYMBOLS.item} Pago: ${payment?.title ?? formData.paymentMethod}`);
  if (formData.notes?.trim()) {
    lines.push(`${SYMBOLS.item} Nota: ${formData.notes.trim()}`);
  }
  lines.push("");

  lines.push(`¿Me confirmás la disponibilidad y cómo seguimos? ¡Gracias! ${SYMBOLS.sparkle}`);

  return lines.map((line) => line.trimEnd()).join("\n");
}

export function generateWhatsAppMessage(props: GenerateWhatsAppMessageProps): string {
  const text = buildWhatsAppText(props);
  // api.whatsapp.com conserva mejor los caracteres especiales que el redireccionamiento de wa.me
  return `https://api.whatsapp.com/send?phone=${STORE_INFO.whatsappNumber}&text=${encodeURIComponent(text)}`;
}

/**
 * Convierte un celular argentino escrito como sea al formato de WhatsApp:
 * 54 (país) + 9 (celular) + código de área sin 0 + número sin 15.
 *   "358 480-0580"       → 5493584800580
 *   "0358 15 480-0580"   → 5493584800580
 *   "+54 9 358 4800580"  → 5493584800580
 *   "11 15 2345-6789"    → 5491123456789
 */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("549")) digits = digits.slice(3);
  else if (digits.startsWith("54")) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");

  // Código de área + número siempre suman 10 dígitos. Si hay 12, sobra el "15"
  // que se marca después del código de área (que tiene 2, 3 o 4 dígitos).
  if (digits.length === 12) {
    const areaLengths = digits.startsWith("11") ? [2] : [3, 4, 2];
    for (const len of areaLengths) {
      if (digits.slice(len, len + 2) === "15") {
        digits = digits.slice(0, len) + digits.slice(len + 2);
        break;
      }
    }
  }

  return digits.length === 10 ? `549${digits}` : digits;
}
