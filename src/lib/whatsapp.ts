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
 * IMPORTANTE sobre emojis: WhatsApp Web / escritorio rompe los emojis "nuevos"
 * (fuera del rango básico de Unicode, por ejemplo 🌿 💰 📋) al abrir el link y
 * los muestra como "�". Acá solo se usan símbolos del rango básico (✂ ✨ ▪),
 * que se ven bien en celular, web y escritorio.
 */
const SYMBOLS = {
  brand: "✂️", // ✂️
  item: "▪️", // ▪️
  sparkle: "✨", // ✨
};

/** Quita cualquier carácter fuera del rango básico (emojis que el cliente tipee en las notas). */
function bmpOnly(text: string): string {
  return Array.from(text)
    .filter((ch) => (ch.codePointAt(0) ?? 0) <= 0xffff)
    .join("");
}

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
  lines.push(`${SYMBOLS.brand} *NUEVO PEDIDO*`);
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

  return lines.map((line) => bmpOnly(line).trimEnd()).join("\n");
}

export function generateWhatsAppMessage(props: GenerateWhatsAppMessageProps): string {
  const text = buildWhatsAppText(props);
  // api.whatsapp.com conserva mejor los caracteres especiales que el redireccionamiento de wa.me
  return `https://api.whatsapp.com/send?phone=${STORE_INFO.whatsappNumber}&text=${encodeURIComponent(text)}`;
}

/**
 * Convierte un teléfono argentino escrito como sea ("358 480-0580", "0358 4800580",
 * "+54 9 358 4800580") al formato que usa WhatsApp: 549 + código de área + número.
 */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10) return `549${digits}`;
  return digits;
}
