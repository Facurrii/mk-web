/** Días que un pedido puede quedar "pendiente" antes de vencer automáticamente. */
export const ORDER_EXPIRY_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Días completos transcurridos desde la creación del pedido. */
export function daysSince(dateIso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(dateIso).getTime()) / DAY_MS));
}

/** Días que le quedan a un pedido pendiente antes de vencer (0 = vence hoy). */
export function daysUntilExpiry(dateIso: string, now: Date = new Date()): number {
  return Math.max(0, ORDER_EXPIRY_DAYS - daysSince(dateIso, now));
}

export const CANCEL_REASON_LABELS: Record<string, string> = {
  vencido_sin_pago: `Vencido: sin pago en ${ORDER_EXPIRY_DAYS} días`,
  cancelado_por_admin: "Cancelado manualmente",
};
