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
    costura: <Scissors className="h-6 w-6 text-stone-700" />,
    trabajo: <Laptop className="h-6 w-6 text-stone-700" />,
    cotidiano: <Sparkles className="h-6 w-6 text-stone-700" />,
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-100 border-b border-stone-200 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block rounded-full bg-stone-200/80 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-stone-700 mb-6">
            Diseño de autor & Confección textil
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-stone-900 max-w-3xl mx-auto leading-tight">
            Objetos funcionales para ordenar tu día a día
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
            Accesorios textiles pensados para cuidar tus herramientas de trabajo,
            organizar tu taller y acompañarte en cada momento de tu rutina.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/productos"
              className="rounded-md bg-stone-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-stone-800 transition flex items-center gap-2"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#historia"
              className="rounded-md border border-stone-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-stone-700 hover:bg-white hover:text-stone-950 transition"
            >
              Conocer el proyecto
            </a>
          </div>
        </div>

        {/* Decorative background subtle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-stone-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
      </section>

      {/* 3 Main Collections Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
            Nuestras Colecciones
          </h2>
          <p className="text-stone-500 text-sm mt-2">
            Organizadas según la necesidad de cada momento de tu jornada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoria=${cat.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-8 transition-all hover:border-stone-400 hover:shadow-lg"
            >
              <div>
                <div className="h-12 w-12 rounded-lg bg-stone-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {categoryIcons[cat.slug] || <Sparkles className="h-6 w-6 text-stone-700" />}
                </div>
                <h3 className="font-serif text-xl font-medium text-stone-900 group-hover:text-stone-700 transition">
                  {cat.name}
                </h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-stone-900 uppercase tracking-wider group-hover:gap-3 transition-all">
                <span>Explorar piezas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-stone-500">
              Selección
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
              Productos Destacados
            </h2>
          </div>

          <Link
            href="/productos"
            className="text-sm font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1 group"
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
        <div className="rounded-2xl bg-stone-900 text-stone-200 overflow-hidden p-8 sm:p-14 relative">
          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-stone-400">
              Detrás de cada pieza
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl text-white font-medium leading-snug">
              &ldquo;Transformar una necesidad propia en objetos que te ayuden a organizarte.&rdquo;
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
              {STORE_INFO.story}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="border-l-2 border-stone-500 pl-4">
                <p className="font-serif text-white font-medium">Mercedes Kilmurray</p>
                <p className="text-xs text-stone-400">
                  Lic. en Diseño e Indumentaria • Creadora
                </p>
              </div>

              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-400 hover:text-white underline sm:ml-auto"
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
