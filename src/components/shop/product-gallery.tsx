"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { ProductImage } from "@/types/database";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  colorName?: string;
  /** Contenido superpuesto (por ejemplo, el chip del color). */
  overlay?: React.ReactNode;
}

/**
 * Galería de la ficha de producto.
 * - Celular: se desliza con el dedo (scroll-snap) y muestra puntitos.
 * - Compu: foto grande + miniaturas clickeables.
 * El padre le pasa key={color} para que vuelva a la primera foto al cambiar de color.
 */
export function ProductGallery({ images, productName, colorName, overlay }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    setActive(index);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-3xl bg-white border border-[#631E2E]/10 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-sm">
        <ShoppingBag className="h-32 w-32 text-[#631E2E]/20 stroke-[1]" />
        <span className="font-serif text-lg font-medium text-[#631E2E] mt-4 uppercase tracking-wider text-center">
          {productName}
        </span>
        {colorName && (
          <span className="font-script text-xl text-[#B4AF3B] mt-1 lowercase">color: {colorName}</span>
        )}
        {overlay}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] w-full rounded-3xl bg-white border border-[#631E2E]/10 overflow-hidden shadow-sm">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={img.id} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={img.image_url}
                alt={`${productName}${colorName ? ` color ${colorName}` : ""} — foto ${i + 1}`}
                fill
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {overlay}

        {/* Puntitos (celular) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-white" : "w-1.5 bg-white/60"
                } shadow`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas (compu) */}
      {images.length > 1 && (
        <div className="hidden lg:grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-[#631E2E]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.image_url} alt="" fill sizes="10vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
