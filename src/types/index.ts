export type ProductCategory = "Men" | "Women" | "Accessories" | "New Arrivals";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: ProductCategory;
  image: string;
  imageUrl: string; // alias for compatibility
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  tag?: "New" | "Trending" | "Bestseller" | "Limited";
  isFeatured?: boolean;
  details?: {
    material: string;
    fit: string;
    care: string;
    origin: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
}

export interface ValueProp {
  id: string;
  title: string;
  description: string;
  iconName: "quality" | "shipping" | "security" | "returns";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

export type PaymentMethod = "cod" | "online_demo";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  placedAt: string;
  estimatedDelivery: string;
}

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AdminOrderItem {
  id: number | string;
  order_id: string;
  product_id: number | string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  item_total: number;
  created_at?: string;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items?: AdminOrderItem[];
}


