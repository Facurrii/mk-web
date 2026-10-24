import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { MessageCircle, MapPin, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Order } from "@/types/database";
import { STORE_INFO } from "@/lib/constants";


export default async function AdminOrdersPage() {
  let orders: Order[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });

    if (data && !error) {
      orders = data as Order[];
    }
  } catch {
    // Si no hay conexión o no hay órdenes aún
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
          Historial de Pedidos
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Registro de compras iniciadas desde el checkout de la tienda por WhatsApp.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <Clock className="h-10 w-10 text-stone-300 mx-auto stroke-[1.5]" />
          <h3 className="mt-4 font-serif text-base font-medium text-stone-800">
            Aún no hay pedidos registrados
          </h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            Cuando un comprador finalice su carrito en la web, el pedido quedará guardado aquí automáticamente antes de abrir WhatsApp.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const customerWaLink = `https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
              `¡Hola ${order.customer_name}! Te escribo de Mer Kilmurray Design en relación a tu pedido #${order.order_number}.`
            )}`;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-semibold text-stone-900">
                      Pedido #{order.order_number}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        order.status === "confirmado" || order.status === "entregado"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {order.status}
                    </span>
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
                  </div>
                </div>

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

                {/* Footer total and WhatsApp button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100">
                  <div className="text-sm">
                    <span className="text-stone-500">Total: </span>
                    <span className="font-semibold text-stone-900 text-base">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  <a
                    href={customerWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Escribir al WhatsApp del cliente</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
