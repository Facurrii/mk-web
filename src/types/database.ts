export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string | null;
  stock: number;
  sku: string | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  base_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
};

export type DeliveryMethod = "retiro" | "cadeteria" | "andreani";
export type PaymentMethod = "transferencia" | "efectivo";
export type OrderStatus = "pendiente" | "confirmado" | "entregado" | "cancelado";

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  payment_method: PaymentMethod;
  notes: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  color_name: string | null;
  quantity: number;
  unit_price: number;
};
