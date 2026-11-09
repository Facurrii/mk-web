"use client";

import { useMemo, useState, useTransition } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/database";
import { CANCEL_REASON_LABELS, daysSince, daysUntilExpiry } from "@/lib/orders";
import {
  cancelOrderAction,
  confirmOrderPaymentAction,
  markOrderDeliveredAction,
} from "@/actions/admin-orders";
import { toWhatsAppNumber } from "@/lib/whatsapp";

export type StockByVariant = Record<string, number>;

type Tab = "pendientes" | "confirmados" | "cancelados" | "todos";

const TABS: { key: Tab; label: string; statuses: OrderStatus[] }[] = [
  { key: "pendientes", label: "Pendientes", statuses: ["pendiente"] },
  { key: "confirmados", label: "Confirmados", statuses: ["confirmado", "entregado"] },
  { key: "cancelados", label: "Cancelados", statuses: ["cancelado"] },
  { key: "todos", label: "Todos", statuses: ["pendiente", "confirmado", "entregado", "cancelado"] },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  entregado: "bg-sky-50 text-sky-700 border-sky-200",
  cancelado: "bg-stone-100 text-stone-500 border-stone-300",
};

type Feedback = { orderId: string; type: "success" | "error"; text: string };

/** Lista de ítems del pedido que hoy no tienen stock suficiente. */
function getStockShortages(order: Order, stockByVariant: StockByVariant): string[] {
  const needed = new Map<string, { qty: number; label: string }>();
  const missing: string[] = [];

  for (const item of order.items ?? []) {
    const label = `${item.product_name}${item.color_name ? ` (${item.color_name})` : ""}`;
    if (!item.variant_id) {
      missing.push(`${label}: ya no existe`);
      continue;
    }
    const prev = needed.get(item.variant_id);
    needed.set(item.variant_id, { qty: (prev?.qty ?? 0) + item.quantity, label });
  }

  for (const [variantId, { qty, label }] of needed) {
    const available = stockByVariant[variantId] ?? 0;
    if (available < qty) missing.push(`${label}: pide ${qty}, hay ${available}`);
  }

  return missing;
}

function waLink(order: Order, text: string) {
  return `https://api.whatsapp.com/send?phone=${toWhatsAppNumber(order.customer_phone)}&text=${encodeURIComponent(text)}`;
}

export function OrdersManagerClient({
  orders,
  stockByVariant,
}: {
  orders: Order[];
  stockByVariant: StockByVariant;
}) {
  const [tab, setTab] = useState<Tab>("pendientes");
  const [confirming, setConfirming] = useState<{ id: string; action: "pay" | "cancel" } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { pendientes: 0, confirmados: 0, cancelados: 0, todos: orders.length };
    for (const o of orders) {
      for (const t of TABS) if (t.key !== "todos" && t.statuses.includes(o.status)) c[t.key]++;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const statuses = TABS.find((t) => t.key === tab)!.statuses;
    const list = orders.filter((o) => statuses.includes(o.status));
    // Pendientes: los más viejos primero (los que están por vencer)
    return tab === "pendientes"
      ? [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
      : list;
  }, [orders, tab]);

  const run = (orderId: string, fn: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>) => {
    setConfirming(null);
    setBusyId(orderId);
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await fn(orderId);
        setFeedback({
          orderId,
          type: res.success ? "success" : "error",
          text: (res.success ? res.message : res.error) || "",
        });
      } catch {
        setFeedback({ orderId, type: "error", text: "Error de conexión. Probá de nuevo." });
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
              tab === t.key
                ? "bg-[#631E2E] text-white border-[#631E2E]"
                : "bg-white text-stone-600 border-stone-200 hover:border-[#631E2E]/40"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {/* Mensaje global (para pedidos que cambiaron de pestaña tras la acción) */}
      {feedback && !visible.some((o) => o.id === feedback.orderId) && (
        <FeedbackBox feedback={feedback} order={orders.find((o) => o.id === feedback.orderId)} />
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <Clock className="h-10 w-10 text-stone-300 mx-auto stroke-[1.5]" />
          <h3 className="mt-4 font-serif text-base font-medium text-stone-800">
            No hay pedidos en esta sección
          </h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            Cuando un comprador finalice su carrito en la web, el pedido queda guardado acá como pendiente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((order) => {
            const isPending = order.status === "pendiente";
            const shortages = isPending ? getStockShortages(order, stockByVariant) : [];
            const waiting = daysSince(order.created_at);
            const left = daysUntilExpiry(order.created_at);
            const busy = busyId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-lg font-semibold text-stone-900">
                      Pedido #{order.order_number}
                    </span>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                    {isPending && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          left <= 1 ? "bg-rose-50 text-rose-700" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {waiting === 0 ? "Hoy" : `Hace ${waiting} día${waiting === 1 ? "" : "s"}`}
                        {" · "}
                        {left === 0 ? "vence hoy" : `vence en ${left} día${left === 1 ? "" : "s"}`}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-stone-400">
                    {new Date(order.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Estado de stock (solo pendientes) */}
                {isPending &&
                  (shortages.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Hay stock para este pedido. Podés pasarle los datos de pago.
                    </div>
                  ) : (
                    <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Sin stock suficiente hoy</span> — avisale al
                        cliente antes de pasarle los datos de pago:
                        <ul className="mt-1 list-disc pl-4">
                          {shortages.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                {/* Customer and Logistics Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-lg">
                  <div>
                    <span className="font-medium text-stone-900 block">Cliente:</span>
                    <span>{order.customer_name}</span>
                    <span className="block text-stone-500">{order.customer_phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-stone-900 block">Entrega:</span>
                    <span className="capitalize">{order.delivery_method}</span>
                    {order.delivery_address && (
                      <span className="block text-stone-500 truncate" title={order.delivery_address}>
                        {order.delivery_address}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-stone-900 block">Pago:</span>
                    <span className="capitalize">{order.payment_method}</span>
                    {order.payment_confirmed_at && (
                      <span className="block text-emerald-700">
                        Confirmado el{" "}
                        {new Date(order.payment_confirmed_at).toLocaleDateString("es-AR")}
                      </span>
                    )}
                    {order.status === "cancelado" && (
                      <span className="block text-stone-500">
                        {CANCEL_REASON_LABELS[order.cancel_reason ?? ""] ?? "Cancelado"}
                      </span>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <p className="text-xs text-stone-600 italic border-l-2 border-[#E2A6BA] pl-3">
                    “{order.notes}”
                  </p>
                )}

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="text-xs space-y-1.5 pt-1">
                    <span className="font-medium text-stone-900 block">Productos solicitados:</span>
                    <ul className="divide-y divide-stone-100">
                      {order.items.map((item) => (
                        <li key={item.id} className="py-1.5 flex justify-between text-stone-700">
                          <span>
                            {item.quantity}x {item.product_name}
                            {item.color_name && (
                              <span className="text-stone-500"> ({item.color_name})</span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback?.orderId === order.id && <FeedbackBox feedback={feedback} order={order} />}

                {/* Footer */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-stone-100">
                  <div className="text-sm">
                    <span className="text-stone-500">Total: </span>
                    <span className="font-semibold text-stone-900 text-base">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={waLink(
                        order,
                        `¡Hola ${order.customer_name}! Te escribo de Mer Kilmurray Design en relación a tu pedido #${order.order_number}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>

                    {busy ? (
                      <span className="inline-flex items-center gap-2 px-3 py-2 text-xs text-stone-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Procesando…
                      </span>
                    ) : confirming?.id === order.id ? (
                      <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-1.5 text-xs">
                        <span className="text-stone-700">
                          {confirming.action === "pay"
                            ? "¿Confirmás que recibiste el pago? Se descuenta el stock."
                            : order.status === "pendiente"
                            ? "¿Cancelar este pedido?"
                            : "¿Cancelar? Se devuelve el stock."}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            run(
                              order.id,
                              confirming.action === "pay" ? confirmOrderPaymentAction : cancelOrderAction
                            )
                          }
                          className={`rounded-md px-3 py-1 font-semibold text-white ${
                            confirming.action === "pay"
                              ? "bg-[#631E2E] hover:bg-[#47131F]"
                              : "bg-rose-600 hover:bg-rose-700"
                          }`}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="rounded-md px-3 py-1 font-semibold text-stone-600 hover:bg-stone-200"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        {order.status !== "cancelado" && (
                          <button
                            type="button"
                            onClick={() => setConfirming({ id: order.id, action: "cancel" })}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </button>
                        )}
                        {order.status === "confirmado" && (
                          <button
                            type="button"
                            onClick={() => run(order.id, markOrderDeliveredAction)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                          >
                            <PackageCheck className="h-4 w-4" />
                            Marcar entregado
                          </button>
                        )}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setConfirming({ id: order.id, action: "pay" })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#631E2E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#47131F] transition"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirmar pago
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedbackBox({ feedback, order }: { feedback: Feedback; order?: Order }) {
  const ok = feedback.type === "success";
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs ${
        ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
      }`}
    >
      <span>
        {order && <strong>Pedido #{order.order_number}: </strong>}
        {feedback.text}
      </span>
      {!ok && order && feedback.text.includes("stock") && (
        <a
          href={waLink(
            order,
            `¡Hola ${order.customer_name}! Te escribo de Mer Kilmurray Design por tu pedido #${order.order_number}. Lamentablemente uno de los productos se quedó sin stock. ¿Querés que lo cambiemos por otro color o te aviso cuando vuelva a haber?`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Avisar al cliente
        </a>
      )}
    </div>
  );
}
