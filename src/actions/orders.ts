"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CartItem, CheckoutFormData } from "@/types/cart";

const orderSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerPhone: z.string().min(8, "Ingresá un número de teléfono válido"),
  deliveryMethod: z.enum(["retiro", "cadeteria", "andreani"]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(["transferencia", "efectivo"]),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      variantId: z.string().optional(),
      colorName: z.string().optional(),
      quantity: z.number().int().positive(),
      price: z.number().nullable(),
    })
  ).min(1, "El carrito no puede estar vacío"),
  totalAmount: z.number().nonnegative(),
});

export type CreateOrderInput = CheckoutFormData & {
  items: CartItem[];
  totalAmount: number;
};

export async function createOrderAction(data: CreateOrderInput) {
  try {
    const validated = orderSchema.parse(data);

    // Instancia el cliente seguro con Service Role
    const supabase = createAdminClient();

    // 1. VERIFICACIÓN DE STOCK DISPONIBLE (no reserva: solo evita pedir algo agotado)
    for (const item of validated.items) {
      if (item.variantId) {
        const { data: variantData } = await supabase
          .from("product_variants")
          .select("id, stock, color_name, product_id")
          .eq("id", item.variantId)
          .maybeSingle();

        if (variantData) {
          if (variantData.stock < item.quantity) {
            const availableMsg =
              variantData.stock === 0
                ? "se encuentra agotado"
                : `quedan solo ${variantData.stock} unidad(es)`;

            return {
              success: false,
              error: `No hay suficiente stock de "${item.productName}" (Color: ${item.colorName || "seleccionado"}): ${availableMsg}. Por favor ajustá la cantidad en el carrito.`,
            };
          }
        }
      }
    }

    // 2. INSERTAR ORDEN PRINCIPAL
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: validated.customerName,
        customer_phone: validated.customerPhone,
        delivery_method: validated.deliveryMethod,
        delivery_address: validated.deliveryAddress || null,
        payment_method: validated.paymentMethod,
        notes: validated.notes || null,
        total_amount: validated.totalAmount,
        status: "pendiente",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Error al registrar pedido en Supabase:", orderError);
      return {
        success: true,
        orderNumber: undefined,
        warning: "No se pudo sincronizar con la base de datos, pero el pedido por WhatsApp sigue activo.",
      };
    }

    // 3. INSERTAR ITEMS
    // El stock NO se descuenta acá: se descuenta recién cuando el admin confirma
    // el pago desde /admin/pedidos (función SQL confirm_order_payment).
    const orderItems = validated.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      product_name: item.productName,
      color_name: item.colorName || null,
      quantity: item.quantity,
      unit_price: item.price || 0,
    }));

    await supabase.from("order_items").insert(orderItems);

    revalidatePath("/admin/pedidos");

    return {
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Datos del formulario inválidos.",
      };
    }

    console.error("Error en createOrderAction:", error);
    return {
      success: true,
      orderNumber: undefined,
    };
  }
}
