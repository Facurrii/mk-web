import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_EXPIRY_DAYS } from "@/lib/orders";

/**
 * Vercel Cron (ver vercel.json): corre una vez por día.
 * Cancela los pedidos que siguen "pendiente" después de ORDER_EXPIRY_DAYS días.
 * No toca stock: un pedido pendiente nunca descontó nada.
 */
export async function GET(request: NextRequest) {
  // Vercel envía "Authorization: Bearer <CRON_SECRET>" automáticamente.
  // Sin esto, cualquiera podría disparar la cancelación llamando a la URL.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ORDER_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelado",
      cancel_reason: "vencido_sin_pago",
      cancelled_at: new Date().toISOString(),
    })
    .eq("status", "pendiente")
    .lt("created_at", cutoff)
    .select("order_number");

  if (error) {
    console.error("Error al vencer pedidos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data && data.length > 0) revalidatePath("/admin/pedidos");

  return NextResponse.json({
    expired: data?.length ?? 0,
    orders: data?.map((o) => o.order_number) ?? [],
  });
}
