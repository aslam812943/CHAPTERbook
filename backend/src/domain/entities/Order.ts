import { Address } from "./User";

export type { Pagination, PaginatedResult } from "./common";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed";
export type PaymentMethod = "razorpay" | "cod";

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderRef: string;
  userId: string;
  items: OrderItem[];
  itemsTotal: number;
  // -1 means the delivery address couldn't be geocoded (fee still applied
  // via a fallback tier - see deliveryPricing.ts).
  deliveryDistanceKm: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddressSnapshot: Address;
  status: OrderStatus;
  whatsappMessage: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  orderRef: string;
  items: OrderItem[];
  itemsTotal: number;
  deliveryDistanceKm: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddressSnapshot: Address;
  whatsappMessage: string;
  paymentMethod: PaymentMethod;
}
