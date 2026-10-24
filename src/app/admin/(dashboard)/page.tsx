import Link from "next/link";
import { Package, ShoppingBag, ArrowRight, Plus, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";


export default async function AdminDashboardPage() {
  let productsCount = INITIAL_PRODUCTS.length;
  let ordersCount = 0;
  let pendingOrdersCount = 0;

  try {
    const supabase = await createClient();

    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, status"),
    ]);

    if (productsRes.count !== null && productsRes.count !== undefined) {
      productsCount = productsRes.count;
    }

    if (ordersRes.data) {
      ordersCount = ordersRes.data.length;
      pendingOrdersCount = ordersRes.data.filter((o) => o.status === "pendiente").length;
    }
  } catch {
    // Si no está conectado aún, se muestra con mock
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
            ¡Hola, Mercedes!
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Este es el resumen general de tu tienda Mer Kilmurray Design.
          </p>
        </div>

        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Administrar Catálogo</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Productos
            </span>
            <Package className="h-5 w-5 text-stone-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-stone-900">
            {productsCount}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Activos en el catálogo público
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Pedidos Recibidos
            </span>
            <ShoppingBag className="h-5 w-5 text-stone-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-stone-900">
            {ordersCount}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Generados desde el checkout
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pendientes
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-stone-900">
            {pendingOrdersCount}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Aguardando confirmación en WhatsApp
          </p>
        </div>
      </div>

      {/* Direct Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-medium text-stone-900">
            Gestión de Productos
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Podés modificar precios, cambiar descripciones, activar o pausar piezas y gestionar las variantes de color (Gris, Bordó, Verde).
          </p>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-900 hover:text-stone-700 transition"
          >
            <span>Ir a catálogo de productos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-medium text-stone-900">
            Historial de Pedidos
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Revisá los pedidos generados por tus clientes, sus datos de contacto, la dirección para Andreani o cadetería y el estado del cobro.
          </p>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-900 hover:text-stone-700 transition"
          >
            <span>Ver historial de pedidos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
