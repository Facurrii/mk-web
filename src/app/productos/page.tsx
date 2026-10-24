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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
          {activeCategory ? activeCategory.name : "Catálogo de Productos"}
        </h1>
        <p className="mt-2 text-sm text-stone-600 max-w-2xl font-light">
          {activeCategory
            ? activeCategory.description
            : "Explorá todas nuestras piezas textiles pensadas para la costura, el trabajo y la organización diaria."}
        </p>

        {/* Category Pills Filter */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center sm:justify-start">
          <Link
            href="/productos"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              !categoria
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
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
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
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
        <div className="py-20 text-center">
          <p className="text-stone-500 text-sm">
            No se encontraron productos en esta categoría.
          </p>
          <Link
            href="/productos"
            className="mt-4 inline-block text-xs font-medium text-stone-900 underline"
          >
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
