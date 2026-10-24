import Link from "next/link";
import { MessageCircle, Truck, CreditCard, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { STORE_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto border-t border-stone-800">
      {/* Benefit Highlights */}
      <div className="border-b border-stone-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <Truck className="h-8 w-8 text-stone-400 shrink-0" />
            <div>
              <h4 className="font-medium text-stone-100">Envíos a todo el país</h4>
              <p className="text-xs text-stone-400 mt-1">Retiro local, cadetería y envíos por Andreani.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <CreditCard className="h-8 w-8 text-stone-400 shrink-0" />
            <div>
              <h4 className="font-medium text-stone-100">Transferencia o Efectivo</h4>
              <p className="text-xs text-stone-400 mt-1">Coordinás directo con Mercedes sin intermediarios.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <ShieldCheck className="h-8 w-8 text-stone-400 shrink-0" />
            <div>
              <h4 className="font-medium text-stone-100">Diseño de autor</h4>
              <p className="text-xs text-stone-400 mt-1">Piezas textiles pensadas para durar y organizar tu día.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-serif text-xl tracking-wider text-stone-100 uppercase">
            Mer Kilmurray Design
          </h3>
          <p className="text-sm text-stone-400 max-w-md leading-relaxed">
            {STORE_INFO.story}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-emerald-400 hover:bg-stone-700 transition"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-100 mb-4">
            Categorías
          </h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              <Link href="/productos?categoria=costura" className="hover:text-stone-200 transition">
                Costura & Taller
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=trabajo" className="hover:text-stone-200 transition">
                Trabajo & Notebook
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=cotidiano" className="hover:text-stone-200 transition">
                Cotidiano & Viaje
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-stone-200 transition">
                Todos los productos
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-100 mb-4">
            Contacto
          </h4>
          <p className="text-sm text-stone-400">
            {STORE_INFO.location}
          </p>
          <p className="text-sm text-stone-400 mt-2">
            WhatsApp: <span className="text-stone-200">{STORE_INFO.phone}</span>
          </p>
          <p className="text-sm text-stone-400 mt-1">
            Instagram: <span className="text-stone-200">{STORE_INFO.instagramHandle}</span>
          </p>
          <div className="pt-6">
            <Link
              href="/admin/login"
              className="text-xs text-stone-500 hover:text-stone-400 transition underline"
            >
              Acceso Administración
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
        © 2026 Mer Kilmurray Design. Todos los derechos reservados.
      </div>
    </footer>
  );
}
