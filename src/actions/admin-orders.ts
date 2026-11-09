"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin, UNAUTHORIZED } from "@/lib/supabase/require-admin";

type ActionResult = { success: true; message: string } | { success: false; error: string };

function revalidateAll() {
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/productos", "layout");
  revalidatePath("/");
}

/**
 * Confirma el pago de un pedido pendiente y descuenta el stock (todo o nada).
 */
export async function confirmOrderPaymentAction(orderId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("confirm_order_payment", { p_order_id: orderId });

    if (error) {
      // Los errores de stock vienen con el prefijo "STOCK:" desde la función SQL
      if (error.message.startsWith("STOCK:")) {
        return {
          success: false,
          error: `No se pudo confirmar: no hay stock suficiente de ${error.message.replace("STOCK:", "").trim()} No se descontó nada.`,
        };
      }
      if (error.code === "PGRST202") {
        return {
          success: false,
          error: "Falta correr la migración 02_order_payment_confirmation.sql en Supabase.",
        };
      }
      console.error("Error en confirm_order_payment:", error);
      return { success: false, error: error.message || "No se pudo confirmar el pago." };
    }

    revalidateAll();
    return { success: true, message: "Pago confirmado. El stock ya se descontó." };
  } catch (err) {
    console.error("Error en confirmOrderPaymentAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al confirmar el pago." };
  }
}

/**
 * Cancela un pedido. Si ya tenía el pago confirmado, devuelve el stock.
 */
export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("cancel_order", {
      p_order_id: orderId,
      p_reason: "cancelado_por_admin",
    });

    if (error) {
      console.error("Error en cancel_order:", error);
      return { success: false, error: error.message || "No se pudo cancelar el pedido." };
    }

    revalidateAll();
    return { success: true, message: "Pedido cancelado." };
  } catch (err) {
    console.error("Error en cancelOrderAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al cancelar el pedido." };
  }
}

/**
 * Marca como entregado un pedido con pago confirmado (no toca stock).
 */
export async function markOrderDeliveredAction(orderId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "entregado" })
      .eq("id", orderId)
      .eq("status", "confirmado")
      .select("id");

    if (error) return { success: false, error: "No se pudo actualizar el pedido." };
    if (!data || data.length === 0) {
      return { success: false, error: "Solo se pueden marcar como entregados los pedidos confirmados." };
    }

    revalidatePath("/admin/pedidos");
    return { success: true, message: "Pedido marcado como entregado." };
  } catch (err) {
    console.error("Error en markOrderDeliveredAction:", err);
    return { success: false, error: "Ocurrió un error inesperado." };
  }
}
