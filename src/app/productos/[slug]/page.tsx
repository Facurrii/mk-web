import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products-service";
import { ProductDetailClient } from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-stone-800">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-stone-800">
          Productos
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="hover:text-stone-800"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Client Interactive Component */}
      <ProductDetailClient product={product} />
    </div>
  );
}
