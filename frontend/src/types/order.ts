import { Address } from "./user";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

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
  totalAmount: number;
  deliveryAddressSnapshot: Address;
  status: OrderStatus;
  whatsappMessage: string;
  createdAt: string;
  updatedAt: string;
}
