import { Address } from "./user";

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
  deliveryDistanceKm: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddressSnapshot: Address;
  status: OrderStatus;
  whatsappMessage: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
