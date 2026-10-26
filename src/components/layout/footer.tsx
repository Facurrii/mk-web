import Link from "next/link";
import { MessageCircle, Truck, CreditCard, ShieldCheck } from "lucide-react";
import { InstagramIcon, ScissorsIcon } from "@/components/ui/icons";
import { STORE_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#47131F] text-[#FBF4E8]/80 mt-auto border-t border-[#631E2E]">
      {/* Benefit Highlights */}
      <div className="border-b border-white/10 py-10 bg-[#3A0F19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#631E2E] flex items-center justify-center shrink-0 text-[#E2A6BA]">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[#FBF4E8] text-base">Envíos a todo el país</h4>
              <p className="text-xs text-[#FBF4E8]/70 mt-0.5">Retiro local, cadetería y envíos por Andreani.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#631E2E] flex items-center justify-center shrink-0 text-[#B4AF3B]">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[#FBF4E8] text-base">Transferencia o Efectivo</h4>
              <p className="text-xs text-[#FBF4E8]/70 mt-0.5">Coordinás directo con Mercedes sin intermediarios.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#631E2E] flex items-center justify-center shrink-0 text-[#B3C1CC]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[#FBF4E8] text-base">Diseño de autor</h4>
              <p className="text-xs text-[#FBF4E8]/70 mt-0.5">Piezas textiles pensadas para durar y organizar tu día.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <ScissorsIcon className="h-11 w-11" withHalo={true} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-serif text-2xl tracking-wider text-[#FBF4E8] uppercase">
                Mer Kilmurray
              </h3>
              <span className="font-script text-lg text-[#E2A6BA] -mt-1 lowercase">
                diseño textil & organización funcional
              </span>
            </div>
          </div>

          <p className="text-sm text-[#FBF4E8]/75 max-w-md leading-relaxed font-light">
            {STORE_INFO.story}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#631E2E] text-[#FBF4E8] hover:text-[#E2A6BA] hover:bg-[#631E2E]/80 transition"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#631E2E] text-[#FBF4E8] hover:text-[#B4AF3B] hover:bg-[#631E2E]/80 transition"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E2A6BA] mb-4">
            Colecciones
          </h4>
          <ul className="space-y-2.5 text-sm text-[#FBF4E8]/80">
            <li>
              <Link href="/productos?categoria=costura" className="hover:text-[#FBF4E8] hover:translate-x-0.5 transition-transform inline-block">
                Costura & Taller
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=trabajo" className="hover:text-[#FBF4E8] hover:translate-x-0.5 transition-transform inline-block">
                Trabajo & Notebook
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=cotidiano" className="hover:text-[#FBF4E8] hover:translate-x-0.5 transition-transform inline-block">
                Cotidiano & Viaje
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-[#FBF4E8] hover:translate-x-0.5 transition-transform inline-block">
                Todos los productos
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E2A6BA] mb-4">
            Contacto
          </h4>
          <p className="text-sm text-[#FBF4E8]/80">
            {STORE_INFO.location}
          </p>
          <p className="text-sm text-[#FBF4E8]/80 mt-2">
            WhatsApp: <span className="text-[#FBF4E8] font-medium">{STORE_INFO.phone}</span>
          </p>
          <p className="text-sm text-[#FBF4E8]/80 mt-1">
            Instagram: <span className="text-[#FBF4E8] font-medium">{STORE_INFO.instagramHandle}</span>
          </p>
          <div className="pt-6">
            <Link
              href="/admin/login"
              className="text-xs text-[#FBF4E8]/50 hover:text-[#E2A6BA] transition underline"
            >
              Acceso Administración
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-[#FBF4E8]/50">
        © 2026 Mer Kilmurray Design. Todos los derechos reservados.
      </div>
    </footer>
  );
}
