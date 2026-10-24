"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { Product } from "@/types/database";

export interface SaveProductInput {
  id?: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number | null;
  is_active: boolean;
  variants: {
    color_name: string;
    color_hex: string;
    stock: number;
  }[];
  images?: string[];
}

/**
 * Guarda (crea o edita) un producto en Supabase, gestionando stock y estado automático
 */
export async function saveProductAction(data: SaveProductInput) {
  try {
    const name = data.name?.trim();
    if (!name) {
      return { success: false, error: "Por favor, ingresá el nombre del producto." };
    }

    if (!data.category_id) {
      return { success: false, error: "Por favor, seleccioná una colección para el producto." };
    }

    if (!data.variants || data.variants.length === 0) {
      return { success: false, error: "Por favor, agregá al menos una variante de color." };
    }

    // Calcular el stock total sumando todas las variantes
    const totalStock = data.variants.reduce((acc, v) => acc + (Math.max(0, Number(v.stock) || 0)), 0);

    // LÓGICA AUTOMÁTICA: Si el stock total es 0, se pausa automáticamente para no vender sin stock
    const effectiveIsActive = totalStock === 0 ? false : data.is_active;

    const supabase = createAdminClient();

    let productId = data.id;

    if (productId) {
      // 1. EDICIÓN DE PRODUCTO EXISTENTE
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: name,
          description: data.description?.trim() || null,
          category_id: data.category_id,
          base_price: data.base_price,
          is_active: effectiveIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error al actualizar producto:", updateError);
        return { success: false, error: "No se pudo actualizar el producto. Verificá los datos e intentá de nuevo." };
      }

      // Reemplazar variantes de color con su stock individual
      await supabase.from("product_variants").delete().eq("product_id", productId);

      const variantsToInsert = data.variants.map((v) => ({
        product_id: productId,
        color_name: v.color_name,
        color_hex: v.color_hex || null,
        stock: Math.max(0, Number(v.stock) || 0),
      }));

      await supabase.from("product_variants").insert(variantsToInsert);

      // Reemplazar imágenes si se enviaron
      if (data.images && data.images.length > 0) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        const imagesToInsert = data.images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_primary: index === 0,
          display_order: index,
        }));
        await supabase.from("product_images").insert(imagesToInsert);
      }
    } else {
      // 2. CREACIÓN DE NUEVO PRODUCTO
      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = "producto";

      const { data: existingSlug } = await supabase
        .from("products")
        .select("id")
        .eq("slug", baseSlug)
        .maybeSingle();

      const finalSlug = existingSlug
        ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
        : baseSlug;

      const { data: newProd, error: insertError } = await supabase
        .from("products")
        .insert({
          name: name,
          slug: finalSlug,
          description: data.description?.trim() || null,
          category_id: data.category_id,
          base_price: data.base_price,
          is_active: effectiveIsActive,
          is_featured: false,
        })
        .select()
        .single();

      if (insertError || !newProd) {
        console.error("Error al crear producto:", insertError);
        return { success: false, error: "No se pudo guardar el nuevo producto. Intentá de nuevo." };
      }

      productId = newProd.id;

      // Insertar variantes con su stock
      const variantsToInsert = data.variants.map((v) => ({
        product_id: productId,
        color_name: v.color_name,
        color_hex: v.color_hex || null,
        stock: Math.max(0, Number(v.stock) || 0),
      }));
      await supabase.from("product_variants").insert(variantsToInsert);

      // Insertar imágenes si hay
      if (data.images && data.images.length > 0) {
        const imagesToInsert = data.images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_primary: index === 0,
          display_order: index,
        }));
        await supabase.from("product_images").insert(imagesToInsert);
      }
    }

    // Consultar el producto completo con sus relaciones para devolverlo al cliente
    const { data: fullProduct } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("id", productId)
      .single();

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");

    const statusNote = totalStock === 0 ? " (Aviso: quedó pausado porque su stock total es 0)" : "";

    return {
      success: true,
      message: (data.id ? "Producto modificado correctamente." : "Producto agregado con éxito.") + statusNote,
      product: fullProduct as Product,
    };
  } catch (err) {
    console.error("Error general en saveProductAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al guardar el producto." };
  }
}

/**
 * Elimina un producto por ID
 */
export async function deleteProductAction(id: string) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar producto:", error);
      return { success: false, error: "No se pudo eliminar el producto." };
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");

    return { success: true, message: "Producto eliminado correctamente." };
  } catch (err) {
    console.error("Error en deleteProductAction:", err);
    return { success: false, error: "Ocurrió un error al intentar eliminar el producto." };
  }
}

/**
 * Cambia el estado publicado/pausado de un producto
 * No permite publicar si el stock total es 0
 */
export async function toggleProductStatusAction(id: string, is_active: boolean) {
  try {
    const supabase = createAdminClient();

    // Si intenta publicar, verificar primero que tenga al menos 1 unidad de stock
    if (is_active) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("product_id", id);

      const totalStock = (variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
      if (totalStock <= 0) {
        return {
          success: false,
          error: "No podés publicar este producto porque no tiene stock disponible (0 unidades). Editá el producto y sumá stock a alguna variante para publicarlo.",
        };
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ is_active: is_active, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      return { success: false, error: "No se pudo actualizar el estado del producto." };
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");

    return {
      success: true,
      message: is_active ? "El producto ahora está publicado." : "El producto ahora está pausado.",
    };
  } catch (err) {
    console.error("Error en toggleProductStatusAction:", err);
    return { success: false, error: "Ocurrió un error al cambiar el estado." };
  }
}

/**
 * Actualiza el precio rápido desde la tabla
 */
export async function updateProductPriceAction(id: string, base_price: number | null) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("products")
      .update({ base_price: base_price, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar precio:", error);
      return { success: false, error: "No se pudo actualizar el precio." };
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath("/");

    return { success: true, message: "Precio actualizado correctamente." };
  } catch (err) {
    console.error("Error en updateProductPriceAction:", err);
    return { success: false, error: "Ocurrió un error al actualizar el precio." };
  }
}

/**
 * Sube una imagen a Supabase Storage (bucket 'products') con normalización de MIME
 */
export async function uploadProductImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No se seleccionó ningún archivo." };
    }

    const supabase = createAdminClient();

    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    let fileExt = rawExt;
    let contentType = "image/jpeg";

    if (rawExt === "png") {
      contentType = "image/png";
      fileExt = "png";
    } else if (rawExt === "webp") {
      contentType = "image/webp";
      fileExt = "webp";
    } else {
      contentType = "image/jpeg";
      fileExt = "jpg";
    }

    const cleanFileName = file.name
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20);
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error al subir imagen a Supabase:", uploadError);
      return {
        success: false,
        error: `No se pudo guardar la imagen: ${uploadError.message || "verificá el formato (JPG, PNG o WEBP)"}.`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err) {
    console.error("Error en uploadProductImageAction:", err);
    return { success: false, error: "Ocurrió un error al procesar la imagen en el servidor." };
  }
}
