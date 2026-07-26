import { Address } from "../../domain/entities/User";
import { OrderItem } from "../../domain/entities/Order";

export function generateOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${random}`;
}

export interface OrderMessageInput {
  orderRef: string;
  items: OrderItem[];
  totalAmount: number;
  address: Address;
}

export function buildOrderWhatsAppMessage(input: OrderMessageInput): string {
  const lines = [
    "New Book Order",
    `Order Ref: *${input.orderRef}*`,
    "",
    "Items:",
    ...input.items.map(
      (item, idx) => `${idx + 1}. ${item.title} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
    ),
    "",
    `Total: ₹${input.totalAmount.toFixed(2)}`,
    "",
    "Deliver to:",
    input.address.fullName,
    input.address.phone,
    input.address.addressLine,
    [input.address.city, input.address.postalCode].filter(Boolean).join(", "),
    input.address.country,
    "",
    `Seller: please confirm this order in the admin panel using Order Ref *${input.orderRef}* before fulfilling — treat this message as a notification only, not the source of truth for items/price.`,
  ];

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string, phoneNumber: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
