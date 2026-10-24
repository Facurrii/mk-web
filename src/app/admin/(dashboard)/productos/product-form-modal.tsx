"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Trash2, Loader2, Check, AlertCircle, Minus } from "lucide-react";
import { Category, Product } from "@/types/database";
import { saveProductAction, uploadProductImageAction } from "@/actions/products";

// Paleta sugerida para agregar con un solo clic
const PRESET_COLORS = [
  { name: "Gris", hex: "#71717A" },
  { name: "Bordó", hex: "#800020" },
  { name: "Verde", hex: "#2D5A27" },
  { name: "Negro", hex: "#18181B" },
  { name: "Crudo / Beige", hex: "#D6D3D1" },
  { name: "Mostaza", hex: "#CA8A04" },
  { name: "Terracota", hex: "#C2410C" },
  { name: "Azul Marino", hex: "#1E3A8A" },
  { name: "Rosa Viejo", hex: "#BE185D" },
];

/**
 * Redimensiona y comprime una imagen en el navegador antes de subirla
 * para evitar problemas de límite de tamaño y acelerar la subida
 */
async function compressImage(file: File, maxDimension = 1400, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    // Si no es imagen estándar, devolver el original
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
            });
            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onProductSaved: (savedProduct: Product, isNew: boolean) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onProductSaved,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);

  // Estados del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPriceOnDemand, setIsPriceOnDemand] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Variantes de color seleccionadas con su STOCK individual
  const [variants, setVariants] = useState<{ color_name: string; color_hex: string; stock: number }[]>([]);

  // Para agregar un color personalizado
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#4A5568");
  const [customColorStock, setCustomColorStock] = useState<number>(5);

  // Fotos
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Feedback y loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcular stock total acumulado
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  // Inicializar o resetear campos al abrir o cambiar de producto
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setDescription(productToEdit.description || "");
      setCategoryId(productToEdit.category_id || (categories[0]?.id || ""));
      setIsActive(productToEdit.is_active ?? true);

      if (productToEdit.base_price === null || productToEdit.base_price === undefined) {
        setIsPriceOnDemand(true);
        setPrice("");
      } else {
        setIsPriceOnDemand(false);
        setPrice(productToEdit.base_price.toString());
      }

      if (productToEdit.variants && productToEdit.variants.length > 0) {
        setVariants(
          productToEdit.variants.map((v) => ({
            color_name: v.color_name,
            color_hex: v.color_hex || "#71717A",
            stock: v.stock ?? 5,
          }))
        );
      } else {
        setVariants([
          { color_name: "Gris", color_hex: "#71717A", stock: 5 },
          { color_name: "Bordó", color_hex: "#800020", stock: 3 },
          { color_name: "Verde", color_hex: "#2D5A27", stock: 4 },
        ]);
      }

      if (productToEdit.images && productToEdit.images.length > 0) {
        setImageUrls(productToEdit.images.map((img) => img.image_url));
      } else {
        setImageUrls([]);
      }
    } else {
      // Modo Nuevo Producto
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setIsPriceOnDemand(false);
      setPrice("");
      setIsActive(true);
      setVariants([
        { color_name: "Gris", color_hex: "#71717A", stock: 5 },
        { color_name: "Bordó", color_hex: "#800020", stock: 3 },
        { color_name: "Verde", color_hex: "#2D5A27", stock: 4 },
      ]);
      setImageUrls([]);
    }

    setErrorMessage(null);
    setShowCustomColor(false);
    setCustomColorName("");
    setCustomColorStock(5);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  // Agregar color sugerido con stock inicial de 5 unidades
  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    if (variants.some((v) => v.color_name.toLowerCase() === preset.name.toLowerCase())) {
      return;
    }
    setVariants([...variants, { color_name: preset.name, color_hex: preset.hex, stock: 5 }]);
  };

  // Modificar stock de una variante específica
  const handleUpdateVariantStock = (index: number, newStock: number) => {
    const safeStock = Math.max(0, isNaN(newStock) ? 0 : newStock);
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: safeStock } : v))
    );
  };

  // Quitar un color
  const handleRemoveColor = (indexToRemove: number) => {
    setVariants(variants.filter((_, i) => i !== indexToRemove));
  };

  // Agregar color personalizado
  const handleAddCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) return;
    if (variants.some((v) => v.color_name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage("Ese color ya está en la lista.");
      return;
    }
    setVariants([
      ...variants,
      { color_name: trimmed, color_hex: customColorHex, stock: Math.max(0, customColorStock) },
    ]);
    setCustomColorName("");
    setCustomColorStock(5);
    setShowCustomColor(false);
    setErrorMessage(null);
  };

  // Subir imagen con compresión previa en el navegador
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i];
        // Comprimir en el navegador antes de enviar
        const readyFile = await compressImage(originalFile);

        const formData = new FormData();
        formData.append("file", readyFile);

        const res = await uploadProductImageAction(formData);
        if (res.success && res.url) {
          setImageUrls((prev) => [...prev, res.url]);
        } else {
          setErrorMessage(res.error || "No se pudo subir la foto.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al conectar con el servidor para subir la foto. Verificá tu conexión.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== indexToRemove));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones en lenguaje simple
    if (!name.trim()) {
      setErrorMessage("Falta el nombre del producto.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Por favor seleccioná una colección.");
      return;
    }

    if (!isPriceOnDemand && (!price || parseFloat(price) <= 0)) {
      setErrorMessage("Ingresá un precio válido o activá la opción 'Precio a consultar'.");
      return;
    }

    if (variants.length === 0) {
      setErrorMessage("Tenés que agregar al menos un color disponible.");
      return;
    }

    setIsSaving(true);

    try {
      const numericPrice = isPriceOnDemand ? null : parseFloat(price);

      const res = await saveProductAction({
        id: productToEdit?.id,
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId,
        base_price: numericPrice,
        is_active: isActive,
        variants: variants,
        images: imageUrls,
      });

      if (res.success && res.product) {
        onProductSaved(res.product, !isEditing);
        onClose();
      } else {
        setErrorMessage(res.error || "No se pudo guardar el producto. Intentá de nuevo.");
      }
    } catch {
      setErrorMessage("Ocurrió un problema de conexión al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fondo oscuro traslúcido */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 z-10">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-50">
          <div>
            <h2 className="font-serif text-xl font-medium text-stone-900">
              {isEditing ? `Editar: ${productToEdit?.name}` : "Agregar nuevo producto"}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Completá los datos y el stock de cada variante para el catálogo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensaje de error si algo falla */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Atención: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Nombre del producto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bolso para máquina de coser"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* 2. Colección (Categoría) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Colección *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              <option value="" disabled>Seleccioná una colección...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} — ({cat.description || "Colección"})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Descripción breve
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contá de qué material está hecho, qué función cumple y cómo ayuda a organizarse..."
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 leading-relaxed"
            />
          </div>

          {/* 4. Precio y Switch "Precio a consultar" */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-800 block">
                  Precio de venta
                </label>
                <span className="text-xs text-stone-500">
                  ¿Tiene precio fijo o es a pedido / consultar?
                </span>
              </div>

              {/* Botón switch para "Precio a consultar" */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPriceOnDemand}
                  onChange={(e) => setIsPriceOnDemand(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 h-4 w-4 accent-stone-900"
                />
                <span className="text-xs font-medium text-stone-700">
                  Precio a consultar
                </span>
              </label>
            </div>

            {!isPriceOnDemand && (
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-stone-500">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required={!isPriceOnDemand}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 140000"
                  className="w-full rounded-xl border border-stone-300 bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            )}
          </div>

          {/* 5. Variantes de color Y STOCK ESPECÍFICO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Colores y Stock disponible *
                </label>
                <p className="text-xs text-stone-500 mt-0.5">
                  Asigná la cantidad de unidades disponibles para cada color.
                </p>
              </div>

              {/* Resumen de stock total acumulado */}
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Stock Total:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    totalStock === 0
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-stone-900 text-white"
                  }`}
                >
                  {totalStock === 0 ? "Agotado (0 unid.)" : `${totalStock} unidades`}
                </span>
              </div>
            </div>

            {/* Listado de variantes con su campo de stock */}
            <div className="space-y-2.5">
              {variants.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center text-xs text-stone-400">
                  No tenés colores agregados todavía. Elegí uno de los sugeridos abajo.
                </div>
              ) : (
                variants.map((v, idx) => (
                  <div
                    key={`${v.color_name}-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition"
                  >
                    {/* Nombre y muestra de color */}
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <span
                        className="h-5 w-5 rounded-full border border-stone-300 shadow-inner shrink-0"
                        style={{ backgroundColor: v.color_hex }}
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        {v.color_name}
                      </span>
                    </div>

                    {/* Selector numérico de stock */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Stock:</span>
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateVariantStock(idx, v.stock - 1)}
                          className="px-2 py-1.5 text-stone-500 hover:bg-stone-100 transition"
                          title="Restar 1 unidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => handleUpdateVariantStock(idx, parseInt(e.target.value))}
                          className="w-14 text-center text-xs font-semibold text-stone-900 focus:outline-none py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateVariantStock(idx, v.stock + 1)}
                          className="px-2 py-1.5 text-stone-500 hover:bg-stone-100 transition"
                          title="Sumar 1 unidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs text-stone-400">unid.</span>
                    </div>

                    {/* Botón quitar variante */}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Quitar este color"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Paleta rápida de 1-clic para sumar colores */}
            <div>
              <span className="text-xs font-medium text-stone-600 block mb-2">
                Agregar colores sugeridos (tocá para sumar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((preset) => {
                  const alreadyAdded = variants.some(
                    (v) => v.color_name.toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddPresetColor(preset)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                        alreadyAdded
                          ? "opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                      {alreadyAdded ? (
                        <Check className="h-3 w-3 text-stone-400" />
                      ) : (
                        <Plus className="h-3 w-3 text-stone-400" />
                      )}
                    </button>
                  );
                })}

                {/* Botón para color personalizado */}
                <button
                  type="button"
                  onClick={() => setShowCustomColor(!showCustomColor)}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-stone-300 px-2.5 py-1 text-xs text-stone-600 hover:border-stone-900 hover:text-stone-900 transition"
                >
                  <Plus className="h-3 w-3" />
                  <span>Otro color...</span>
                </button>
              </div>
            </div>

            {/* Panel desplegable de color personalizado */}
            {showCustomColor && (
              <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs">
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border border-stone-300 p-0.5 bg-white"
                  title="Elegir tono visualmente"
                />
                <input
                  type="text"
                  placeholder="Nombre del color (ej: Cacao, Rosa pastel)"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 bg-white flex-1 min-w-[160px] focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500">Stock:</span>
                  <input
                    type="number"
                    min="0"
                    value={customColorStock}
                    onChange={(e) => setCustomColorStock(parseInt(e.target.value) || 0)}
                    className="w-16 rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-900 bg-white font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="rounded-lg bg-stone-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-stone-800 transition"
                >
                  Agregar a la lista
                </button>
              </div>
            )}
          </div>

          {/* 6. Fotos del producto */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Fotos del producto
              </label>
              <p className="text-xs text-stone-500 mt-0.5">
                Seleccioná fotos desde tu computadora (se optimizan automáticamente antes de guardar).
              </p>
            </div>

            {/* Galería de vistas previas */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {imageUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-stone-300 bg-stone-100 shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                      title="Eliminar foto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-stone-900/80 text-white px-1.5 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input para arrastrar o subir foto */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-xl p-5 text-center cursor-pointer transition bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              {uploadingImage ? (
                <>
                  <Loader2 className="h-6 w-6 text-stone-600 animate-spin" />
                  <span className="text-xs font-medium text-stone-600">
                    Optimizando y subiendo foto a Supabase...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-stone-400 stroke-[1.5]" />
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold text-stone-900 underline">
                      Elegir fotos desde tu equipo
                    </span>{" "}
                    o arrastralas acá
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Cualquier foto de celular o cámara (se comprime automáticamente)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 7. Estado inicial: Publicado o Pausado con aviso automático de stock */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 block">
                Estado de publicación
              </span>
              <span className="text-xs text-stone-500">
                {totalStock === 0
                  ? "Como todas las variantes tienen stock 0, el producto quedará pausado (agotado) automáticamente."
                  : isActive
                  ? "Visible para los compradores en la tienda."
                  : "Oculto en la tienda (ideal para preparar lanzamientos)."}
              </span>
            </div>

            <button
              type="button"
              disabled={totalStock === 0}
              onClick={() => setIsActive(!isActive)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                totalStock === 0
                  ? "bg-rose-100 text-rose-700 border border-rose-200 cursor-not-allowed opacity-80"
                  : isActive
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-stone-200 text-stone-700 border border-stone-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  totalStock === 0
                    ? "bg-rose-500"
                    : isActive
                    ? "bg-emerald-600"
                    : "bg-stone-500"
                }`}
              />
              <span>{totalStock === 0 ? "Agotado (0 stock)" : isActive ? "Publicado" : "Pausado"}</span>
            </button>
          </div>

          {/* Botones de acción inferiores */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || uploadingImage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 transition disabled:opacity-50 min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? "Guardar cambios" : "Crear producto"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
