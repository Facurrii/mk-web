"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Product } from "@/types/database";
import { deleteProductAction } from "@/actions/products";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductDeleted: (productId: string) => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  product,
  onProductDeleted,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        onProductDeleted(product.id);
        onClose();
      } else {
        setErrorMessage(res.error || "No se pudo eliminar el producto.");
      }
    } catch {
      setErrorMessage("Error de conexión al intentar eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro traslúcido */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 z-10 space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              ¿Eliminar producto?
            </h3>
            <span className="text-xs text-stone-500">
              Esta acción es definitiva
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">
          ¿Seguro que querés eliminar <span className="font-semibold text-stone-900">&ldquo;{product.name}&rdquo;</span>? Esta acción no se puede deshacer y el producto dejará de estar disponible en la tienda.
        </p>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-50 min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Borrando...</span>
              </>
            ) : (
              <span>Eliminar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
