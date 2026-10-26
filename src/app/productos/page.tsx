import { getCategories, getProducts } from "@/lib/products-service";
import { ProductCard } from "@/components/shop/product-card";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{
    categoria?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { categoria } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria }),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Header */}
      <div className="border-b border-[#631E2E]/10 pb-10 text-center sm:text-left">
        <span className="font-script text-2xl text-[#631E2E] block">
          confección & detalle
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#631E2E] mt-1">
          {activeCategory ? activeCategory.name : "Catálogo de Productos"}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#2A1A1E]/75 max-w-2xl font-light leading-relaxed">
          {activeCategory
            ? activeCategory.description
            : "Explorá todas nuestras piezas textiles pensadas para la costura, el trabajo y la organización de tu día a día."}
        </p>

        {/* Category Pills Filter */}
        <div className="mt-8 flex flex-wrap gap-2.5 justify-center sm:justify-start">
          <Link
            href="/productos"
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              !categoria
                ? "bg-[#631E2E] text-[#FBF4E8] shadow-sm"
                : "bg-white/80 border border-[#631E2E]/20 text-[#631E2E] hover:bg-white hover:border-[#631E2E]"
            }`}
          >
            Todos ({products.length})
          </Link>

          {categories.map((cat) => {
            const isActive = categoria === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#631E2E] text-[#FBF4E8] shadow-sm"
                    : "bg-white/80 border border-[#631E2E]/20 text-[#631E2E] hover:bg-white hover:border-[#631E2E]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white/60 border border-[#631E2E]/10 p-12">
          <p className="text-[#631E2E] font-serif text-lg font-medium">
            No se encontraron productos en esta colección.
          </p>
          <Link
            href="/productos"
            className="mt-4 inline-block text-xs font-semibold text-[#631E2E] underline hover:text-[#47131F]"
          >
            Ver todos los productos disponibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
