"use client";

import { MessageCircle } from "lucide-react";
import { STORE_INFO } from "@/lib/constants";

export function WhatsAppFloatingButton() {
  const directLink = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola Mercedes! Vi tu tienda online y quería hacerte una consulta sobre tus productos."
  )}`;

  return (
    <a
      href={directLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-200 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
      <span className="hidden sm:inline font-medium tracking-wide">
        ¿Consultas? Escribinos
      </span>
    </a>
  );
}
