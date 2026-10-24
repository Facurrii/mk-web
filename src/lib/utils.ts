import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un precio numérico al formato de moneda argentina ($ 140.000)
 * Si el precio es null o undefined, retorna "A consultar"
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "A consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Genera un slug seguro para URLs a partir de un título
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, "") // Remueve caracteres no alfanuméricos
    .replace(/--+/g, "-"); // Remueve guiones dobles
}
