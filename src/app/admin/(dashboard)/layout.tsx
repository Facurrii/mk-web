import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
        {/* Brand header */}
        <div className="p-6 border-b border-stone-800">
          <span className="font-serif text-lg text-white font-medium block">
            MK Design Admin
          </span>
          <span className="text-xs text-stone-400 block mt-0.5">
            Panel de Gestión
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Resumen</span>
          </Link>

          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            <Package className="h-4 w-4" />
            <span>Productos y Stock</span>
          </Link>

          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Historial Pedidos</span>
          </Link>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs text-stone-400 hover:text-white transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver tienda pública</span>
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-rose-400 hover:bg-stone-800 hover:text-rose-300 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
