"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** Adónde ir si el cliente entró directo (por ejemplo, desde un link de WhatsApp). */
  fallbackHref: string;
  label?: string;
  className?: string;
}

/**
 * Vuelve a la página anterior de la tienda (mantiene el filtro y el scroll del catálogo).
 * Si el cliente llegó desde afuera, lo lleva al catálogo en vez de sacarlo del sitio.
 */
export function BackButton({ fallbackHref, label = "Volver", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const cameFromSite =
      typeof document !== "undefined" &&
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1;

    if (cameFromSite) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border border-[#631E2E]/15 bg-white px-4 py-2 text-sm font-medium text-[#631E2E] shadow-2xs active:scale-95 transition ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
