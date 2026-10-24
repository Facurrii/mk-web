import { DeliveryMethod, PaymentMethod } from "./database";

export type CartItem = {
  id: string; // Composite key: `${productId}-${variantId || 'default'}`
  productId: string;
  productName: string;
  productSlug: string;
  price: number | null; // null si es a consultar
  variantId?: string;
  colorName?: string;
  colorHex?: string;
  quantity: number;
  imageUrl?: string;
};

export type CheckoutFormData = {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
};
