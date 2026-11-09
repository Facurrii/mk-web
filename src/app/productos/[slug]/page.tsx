import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products-service";
import { ProductDetailClient } from "./product-detail-client";
import { getPrimaryImageUrl } from "@/lib/product-images";

// Una sola consulta a la base aunque la usen generateMetadata y la página
const getProduct = cache(getProductBySlug);

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  const description =
    product.description?.slice(0, 160) ?? `${product.name}, diseño textil de autor de Mer Kilmurray.`;
  const image = getPrimaryImageUrl(product);

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Mer Kilmurray Design`,
      description,
      url: `/productos/${product.slug}`,
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

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
