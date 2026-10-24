import { getCategories, getProducts } from "@/lib/products-service";
import { formatPrice } from "@/lib/utils";
import { ProductsManagerClient } from "./products-manager-client";


export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
          Productos y Stock
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Modificá precios, activá o pausá piezas y administrá el catálogo de Mercedes.
        </p>
      </div>

      <ProductsManagerClient initialProducts={products} categories={categories} />
    </div>
  );
}
