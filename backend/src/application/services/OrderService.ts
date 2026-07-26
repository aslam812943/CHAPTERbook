import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Order } from "../../domain/entities/Order";
import { Address } from "../../domain/entities/User";
import { CartService } from "./CartService";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl, generateOrderRef } from "../../shared/utils/whatsappMessage";
import { env } from "../../config/env";

const DUPLICATE_ORDER_WINDOW_MS = 30_000;

export interface CreateOrderResult {
  order: Order;
  whatsappUrl: string;
}

export class OrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository,
    private readonly cartService: CartService
  ) {}

  async createOrder(userId: string, address: Address): Promise<CreateOrderResult> {
    const cartView = await this.cartService.getCart(userId);
    if (cartView.items.length === 0) {
      throw new ValidationError("Your cart is empty");
    }

    const outOfStock = cartView.items.find((item) => item.quantity > item.stock);
    if (outOfStock) {
      throw new ValidationError(`Only ${outOfStock.stock} of "${outOfStock.title}" in stock`);
    }

    const existing = await this.orderRepository.findRecentByUserAndTotal(
      userId,
      cartView.total,
      DUPLICATE_ORDER_WINDOW_MS
    );
    if (existing) {
      return { order: existing, whatsappUrl: buildWhatsAppUrl(existing.whatsappMessage, env.WHATSAPP_NUMBER) };
    }

    const items = cartView.items.map((item) => ({
      bookId: item.bookId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderRef = generateOrderRef();
    const whatsappMessage = buildOrderWhatsAppMessage({
      orderRef,
      items,
      totalAmount: cartView.total,
      address,
    });

    const order = await this.orderRepository.create({
      userId,
      orderRef,
      items,
      totalAmount: cartView.total,
      deliveryAddressSnapshot: address,
      whatsappMessage,
    });

    await this.cartRepository.clear(userId);

    return { order, whatsappUrl: buildWhatsAppUrl(whatsappMessage, env.WHATSAPP_NUMBER) };
  }

  async listForUser(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.filter((order) => order.status !== "pending");
  }

  async getById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }
}
