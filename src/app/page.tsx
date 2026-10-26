import Link from "next/link";
import { ArrowRight, Scissors, Laptop, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { getCategories, getProducts } from "@/lib/products-service";
import { STORE_INFO } from "@/lib/constants";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true }),
  ]);

  const categoryIcons: Record<string, React.ReactNode> = {
    costura: <Scissors className="h-6 w-6 text-[#631E2E]" />,
    trabajo: <Laptop className="h-6 w-6 text-[#631E2E]" />,
    cotidiano: <Sparkles className="h-6 w-6 text-[#631E2E]" />,
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FBF4E8] via-[#F4EBE0] to-[#FBF4E8] border-b border-[#631E2E]/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#E2A6BA] px-4 py-1.5 shadow-2xs mb-6">
            <span className="h-2 w-2 rounded-full bg-[#B4AF3B]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#631E2E]">
              Diseño de autor & Confección textil
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#631E2E] max-w-4xl mx-auto leading-[1.15]">
            Objetos funcionales para ordenar{" "}
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-[#631E2E] block sm:inline font-normal lowercase">
              tu rutina
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#2A1A1E]/80 max-w-2xl mx-auto font-light leading-relaxed">
            Accesorios textiles pensados para cuidar tus herramientas de trabajo,
            organizar tu taller y acompañarte en cada momento de tu día a día.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/productos"
              className="rounded-xl bg-[#631E2E] px-7 py-3.5 text-sm font-semibold text-[#FBF4E8] shadow-md hover:bg-[#47131F] hover:shadow-lg transition-all flex items-center gap-2 group active:scale-95"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#historia"
              className="rounded-xl border border-[#631E2E]/25 bg-white/70 backdrop-blur-xs px-6 py-3.5 text-sm font-semibold text-[#631E2E] hover:bg-white hover:border-[#631E2E] transition active:scale-95"
            >
              Conocer el proyecto
            </a>
          </div>
        </div>

        {/* Ambient subtle color orbs based on the palette */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#E2A6BA]/25 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#B3C1CC]/25 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B4AF3B]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      </section>

      {/* 3 Main Collections Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-script text-2xl sm:text-3xl text-[#631E2E] block">
            organización & diseño
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#631E2E] mt-1">
            Nuestras Colecciones
          </h2>
          <p className="text-[#2A1A1E]/70 text-sm mt-2">
            Piezas agrupadas según la necesidad de cada momento de tu jornada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {categories.map((cat, idx) => {
            // Alternar los tonos suaves de la paleta en las tarjetas
            const accentColors = [
              { bg: "bg-[#E2A6BA]/20", border: "hover:border-[#E2A6BA]", pill: "bg-[#E2A6BA]/30 text-[#631E2E]" },
              { bg: "bg-[#B3C1CC]/25", border: "hover:border-[#B3C1CC]", pill: "bg-[#B3C1CC]/35 text-[#2A1A1E]" },
              { bg: "bg-[#B4AF3B]/20", border: "hover:border-[#B4AF3B]", pill: "bg-[#B4AF3B]/30 text-[#631E2E]" },
            ];
            const accent = accentColors[idx % accentColors.length];

            return (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className={`group relative flex flex-col justify-between rounded-2xl border border-[#631E2E]/10 bg-white p-8 transition-all duration-300 hover:shadow-xl ${accent.border}`}
              >
                <div>
                  <div
                    className={`h-14 w-14 rounded-2xl ${accent.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {categoryIcons[cat.slug] || <Sparkles className="h-6 w-6 text-[#631E2E]" />}
                  </div>

                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${accent.pill}`}>
                    Línea {cat.name}
                  </span>

                  <h3 className="font-serif text-2xl font-medium text-[#631E2E] mt-3 group-hover:text-[#47131F] transition">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#2A1A1E]/70 leading-relaxed font-light">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#631E2E]/10 flex items-center gap-2 text-xs font-semibold text-[#631E2E] uppercase tracking-wider group-hover:gap-3 transition-all">
                  <span>Explorar piezas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4 border-b border-[#631E2E]/10 pb-4">
          <div>
            <span className="font-script text-2xl text-[#631E2E] block">
              favoritos de la marca
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#631E2E]">
              Productos Destacados
            </h2>
          </div>

          <Link
            href="/productos"
            className="text-sm font-semibold text-[#631E2E] hover:text-[#47131F] flex items-center gap-1 group"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Mercedes Story Section */}
      <section id="historia" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#631E2E] via-[#521825] to-[#3D111B] text-[#FBF4E8] overflow-hidden p-8 sm:p-14 lg:p-16 relative shadow-xl border border-[#631E2E]">
          {/* Subtle decorative circles with brand colors */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E2A6BA]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#B4AF3B]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="font-script text-2xl text-[#E2A6BA] block">
              detrás de cada pieza
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-medium leading-snug">
              &ldquo;Transformar una necesidad propia en objetos que te ayuden a organizarte.&rdquo;
            </h2>

            <p className="text-[#FBF4E8]/85 text-base sm:text-lg leading-relaxed font-light">
              {STORE_INFO.story}
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t border-white/15">
              <div className="border-l-2 border-[#E2A6BA] pl-4">
                <p className="font-serif text-xl text-white font-medium">Mercedes Kilmurray</p>
                <p className="text-xs text-[#E2A6BA] font-light mt-0.5">
                  Lic. en Diseño e Indumentaria • Creadora de la marca
                </p>
              </div>

              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#FBF4E8] hover:text-[#E2A6BA] underline sm:ml-auto transition"
              >
                Seguir en Instagram {STORE_INFO.instagramHandle} →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
