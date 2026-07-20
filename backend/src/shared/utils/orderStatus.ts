import { OrderStatus } from "../../domain/entities/Order";

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
