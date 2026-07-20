import { Address } from "./User";

export type { Pagination, PaginatedResult } from "./common";

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  orderRef: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddressSnapshot: Address;
  whatsappMessage: string;
}
