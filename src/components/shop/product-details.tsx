import { Ruler, PackageOpen } from "lucide-react";
import { parseIncludes, parseMeasurements } from "@/lib/product-details";

interface ProductDetailsProps {
  measurements?: string | null;
  includes?: string | null;
}

/** Bloque "Medidas" y "Qué incluye" de la ficha de producto. No se muestra si no hay datos. */
export function ProductDetails({ measurements, includes }: ProductDetailsProps) {
  const groups = parseMeasurements(measurements);
  const items = parseIncludes(includes);

  if (groups.length === 0 && items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#631E2E]/10 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
      {groups.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-serif text-base font-medium text-[#631E2E]">
            <Ruler className="h-4 w-4 text-[#B4AF3B]" />
            Medidas
          </h2>

          {groups.map((group, gi) => (
            <div key={gi} className="space-y-2">
              {group.title && (
                <span className="block font-script text-lg text-[#631E2E]/80 lowercase">
                  {group.title}
                </span>
              )}
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.rows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl bg-[#FBF4E8] px-3.5 py-2.5 border border-[#631E2E]/5"
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#2A1A1E]/50">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 font-serif text-lg font-medium text-[#631E2E] leading-tight">
                      {row.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      )}

      {items.length > 0 && (
        <section className={`space-y-3 ${groups.length > 0 ? "pt-5 border-t border-[#631E2E]/10" : ""}`}>
          <h2 className="flex items-center gap-2 font-serif text-base font-medium text-[#631E2E]">
            <PackageOpen className="h-4 w-4 text-[#B4AF3B]" />
            Qué incluye
          </h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#2A1A1E]/80 font-light">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E2A6BA]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
