import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/database";
import { OrdersManagerClient, StockByVariant } from "./orders-manager-client";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  const stockByVariant: StockByVariant = {};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });

    if (data && !error) {
      orders = data as Order[];
    }

    // Stock actual de las variantes de los pedidos pendientes, para mostrar si hoy alcanza
    const variantIds = Array.from(
      new Set(
        orders
          .filter((o) => o.status === "pendiente")
          .flatMap((o) => o.items ?? [])
          .map((i) => i.variant_id)
          .filter((id): id is string => !!id)
      )
    );

    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, stock")
        .in("id", variantIds);

      for (const v of variants ?? []) {
        stockByVariant[v.id] = v.stock ?? 0;
      }
    }
  } catch {
    // Si no hay conexión o no hay órdenes aún
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
          Pedidos
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          El stock se descuenta recién cuando confirmás el pago. Los pedidos pendientes vencen solos a los 5 días.
        </p>
      </div>

      <OrdersManagerClient orders={orders} stockByVariant={stockByVariant} />
    </div>
  );
}
