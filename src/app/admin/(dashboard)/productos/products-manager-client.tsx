"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Category, Product } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { ProductFormModal } from "./product-form-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import {
  toggleProductStatusAction,
  updateProductPriceAction,
} from "@/actions/products";

interface ProductsManagerClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsManagerClient({
  initialProducts,
  categories,
}: ProductsManagerClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filas expandidas para ver el desglose de stock por variante
  const [expandedStockRows, setExpandedStockRows] = useState<Record<string, boolean>>({});

  // Edición rápida de precio en la tabla
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Toast / Mensajes de confirmación
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category?.slug === selectedCategory);

  // Calcular stock total de un producto
  const getProductTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((acc, v) => acc + (v.stock ?? 0), 0);
  };

  // Toggle para expandir desglose de stock
  const toggleRowStock = (productId: string) => {
    setExpandedStockRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Abrir modal para crear nuevo
  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  // Abrir modal de confirmación de borrado
  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Callback cuando se guarda (crea o edita) un producto
  const handleProductSaved = (savedProduct: Product, isNew: boolean) => {
    if (isNew) {
      setProducts((prev) => [savedProduct, ...prev]);
      showToast("¡Producto creado y agregado al catálogo con éxito!");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      showToast("¡Cambios del producto guardados correctamente!");
    }
  };

  // Callback cuando se elimina un producto
  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
    showToast("El producto ha sido eliminado del catálogo.");
  };

  // Edición rápida de precio
  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setNewPriceValue(product.base_price !== null ? product.base_price.toString() : "");
  };

  const handleSavePrice = async (productId: string) => {
    setIsUpdatingPrice(true);
    const numeric = newPriceValue.trim() === "" ? null : parseFloat(newPriceValue);

    try {
      const res = await updateProductPriceAction(productId, numeric);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, base_price: numeric } : p))
        );
        showToast("Precio actualizado correctamente.");
      } else {
        showToast(res.error || "No se pudo actualizar el precio.", "error");
      }
    } catch {
      showToast("Error de conexión al actualizar precio.", "error");
    } finally {
      setIsUpdatingPrice(false);
      setEditingPriceId(null);
    }
  };

  // Toggle estado publicado / pausado con chequeo de stock 0
  const handleToggleActive = async (product: Product) => {
    const totalStock = getProductTotalStock(product);

    // Si tiene 0 stock y quiere publicarlo, no permitirlo
    if (!product.is_active && totalStock === 0) {
      showToast(
        "No podés publicar este producto porque tiene 0 stock. Hacé clic en 'Editar' y agregá unidades a algún color para reactivarlo.",
        "error"
      );
      return;
    }

    const nextState = !product.is_active;

    // Actualización optimista en la UI
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: nextState } : p))
    );

    try {
      const res = await toggleProductStatusAction(product.id, nextState);
      if (res.success) {
        showToast(
          nextState
            ? `"${product.name}" ahora está publicado en la tienda.`
            : `"${product.name}" ahora está pausado (oculto).`
        );
      } else {
        // Revertir si falló
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: !nextState } : p))
        );
        showToast(res.error || "No se pudo cambiar el estado.", "error");
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !nextState } : p))
      );
      showToast("Error de conexión.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior: Filtro y Botón destacado "Agregar producto" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Filtro por categoría */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Filtrar:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
          >
            <option value="all">Todas las categorías ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-stone-400 hidden md:inline">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
        </div>

        {/* Botón destacado "Agregar producto" */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar producto</span>
        </button>
      </div>

      {/* Tabla de Productos con Stock Total y Desglose */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-4 px-5">Producto</th>
                <th className="py-4 px-4">Colección</th>
                <th className="py-4 px-4">Precio Actual</th>
                <th className="py-4 px-4">Stock Total</th>
                <th className="py-4 px-4">Variantes Color</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                    No se encontraron productos en esta colección.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const totalStock = getProductTotalStock(p);
                  const isExpanded = expandedStockRows[p.id];

                  return (
                    <tr key={p.id} className="group/row hover:bg-stone-50/70 transition">
                      {/* 1. Nombre y descripción */}
                      <td className="py-4 px-5 align-top">
                        <div className="font-semibold text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-400 mt-0.5 max-w-sm line-clamp-1">
                          {p.description || "Sin descripción"}
                        </div>
                      </td>

                      {/* 2. Colección */}
                      <td className="py-4 px-4 text-xs font-medium text-stone-600 align-top">
                        <span className="inline-block rounded-lg bg-stone-100 px-3 py-1 border border-stone-200/60">
                          {p.category?.name || "Sin categoría"}
                        </span>
                      </td>

                      {/* 3. Precio Actual */}
                      <td className="py-4 px-4 font-semibold text-stone-900 align-top">
                        {editingPriceId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-500">$</span>
                            <input
                              type="number"
                              value={newPriceValue}
                              onChange={(e) => setNewPriceValue(e.target.value)}
                              placeholder="A definir"
                              className="w-24 rounded-lg border border-stone-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={isUpdatingPrice}
                              onClick={() => handleSavePrice(p.id)}
                              className="p-1 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition"
                              title="Guardar precio"
                            >
                              {isUpdatingPrice ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded-md bg-stone-200 text-stone-600 hover:bg-stone-300 transition"
                              title="Cancelar"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span>{formatPrice(p.base_price)}</span>
                            <button
                              type="button"
                              onClick={() => handleStartEditPrice(p)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-800 transition rounded hover:bg-stone-100"
                              title="Modificar precio rápido"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 4. STOCK TOTAL CON DESGLOSE EXPANDIBLE */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => toggleRowStock(p.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              totalStock === 0
                                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                : "bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200"
                            }`}
                            title="Hacé clic para ver el stock de cada color"
                          >
                            <span>{totalStock === 0 ? "0 unid. (Agotado)" : `${totalStock} unid.`}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 text-stone-500" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-stone-500" />
                            )}
                          </button>

                          {/* Desglose desplegable por color */}
                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-xs space-y-1.5 min-w-[170px] shadow-2xs animate-in fade-in duration-150">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block border-b border-stone-200 pb-1">
                                Stock por color:
                              </span>
                              {p.variants && p.variants.length > 0 ? (
                                p.variants.map((v, idx) => (
                                  <div
                                    key={`${v.id || v.color_name}-${idx}`}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-2.5 w-2.5 rounded-full border border-stone-300"
                                        style={{ backgroundColor: v.color_hex || "#888" }}
                                      />
                                      <span className="text-stone-700">{v.color_name}:</span>
                                    </div>
                                    <span
                                      className={`font-semibold ${
                                        v.stock === 0 ? "text-rose-600" : "text-stone-900"
                                      }`}
                                    >
                                      {v.stock === 0 ? "0 (Agotado)" : `${v.stock} unid.`}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-stone-400">Sin variantes</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 5. Variantes de Color (Muestras) */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5 pt-1">
                          {p.variants && p.variants.length > 0 ? (
                            p.variants.map((v, i) => (
                              <span
                                key={`${v.id || v.color_name}-${i}`}
                                className={`h-3.5 w-3.5 rounded-full border shadow-2xs transition ${
                                  v.stock === 0
                                    ? "opacity-30 border-dashed border-stone-400"
                                    : "border-stone-300"
                                }`}
                                style={{ backgroundColor: v.color_hex || "#888" }}
                                title={`${v.color_name} — ${
                                  v.stock === 0 ? "Agotado (0 unidades)" : `${v.stock} disponibles`
                                }`}
                              />
                            ))
                          ) : (
                            <span className="text-xs text-stone-400">Sin colores</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Estado (Publicado / Pausado / Agotado) */}
                      <td className="py-4 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition shadow-2xs ${
                            totalStock === 0
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              : p.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-500 border border-stone-300 hover:bg-stone-200"
                          }`}
                          title={
                            totalStock === 0
                              ? "Agotado: Sumá stock para reactivarlo"
                              : "Hacé clic para cambiar estado"
                          }
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              totalStock === 0
                                ? "bg-rose-500"
                                : p.is_active
                                ? "bg-emerald-500"
                                : "bg-stone-400"
                            }`}
                          />
                          <span>
                            {totalStock === 0 ? "Agotado" : p.is_active ? "Publicado" : "Pausado"}
                          </span>
                        </button>
                      </td>

                      {/* 7. Acciones (Editar, Eliminar, Ver ficha) */}
                      <td className="py-4 px-5 text-right align-top">
                        <div className="inline-flex items-center gap-3 pt-0.5">
                          {/* Botón Editar completo */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 transition hover:underline"
                            title="Editar todos los campos del producto y stock"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(p)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rose-600 transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                          </button>

                          {/* Ver ficha en la tienda */}
                          <Link
                            href={`/productos/${p.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition"
                            title="Ver producto en la web"
                          >
                            <span>Ver ficha</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar Producto */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onProductSaved={handleProductSaved}
      />

      {/* Modal para Confirmar Eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onProductDeleted={handleProductDeleted}
      />

      {/* Toast flotante de confirmación */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-stone-900 text-white px-5 py-3.5 shadow-2xl border border-stone-800 text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-stone-400 hover:text-white transition ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
