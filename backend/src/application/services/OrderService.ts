import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Order, PaymentMethod } from "../../domain/entities/Order";
import { Address } from "../../domain/entities/User";
import { CartService } from "./CartService";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl, generateOrderRef } from "../../shared/utils/whatsappMessage";
import { estimateDelivery, DeliveryEstimate } from "../../shared/utils/deliveryPricing";
import { isValidStatusTransition } from "../../shared/utils/orderStatus";
import { env } from "../../config/env";

type GeocodableAddress = Pick<Address, "addressLine" | "city" | "postalCode" | "country">;

function formatAddressForGeocoding(address: GeocodableAddress): string {
  return [address.addressLine, address.city, address.postalCode, address.country].filter(Boolean).join(", ");
}

const DUPLICATE_ORDER_WINDOW_MS = 30_000;

export interface CreateOrderResult {
  order: Order;
  whatsappUrl: string;
}

export class OrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository,
    private readonly cartService: CartService,
    private readonly bookRepository: IBookRepository
  ) {}

  async createOrder(userId: string, address: Address, paymentMethod: PaymentMethod): Promise<CreateOrderResult> {
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

    const { distanceKm, deliveryFee } = await estimateDelivery(formatAddressForGeocoding(address));
    const totalAmount = cartView.total + deliveryFee;

    const orderRef = generateOrderRef();
    const whatsappMessage = buildOrderWhatsAppMessage({
      orderRef,
      items,
      itemsTotal: cartView.total,
      deliveryFee,
      totalAmount,
      address,
    });

    let order = await this.orderRepository.create({
      userId,
      orderRef,
      items,
      itemsTotal: cartView.total,
      deliveryDistanceKm: distanceKm,
      deliveryFee,
      totalAmount,
      deliveryAddressSnapshot: address,
      whatsappMessage,
      paymentMethod,
    });

    // Razorpay orders only commit inventory once payment actually captures
    // (see PaymentService.decrementStockForOrder) and stay "pending" until
    // then so they're hidden from order history (listForUser below) until
    // there's real proof they're legitimate. COD has no equivalent payment-
    // capture event - the order itself *is* the commitment, and stock was
    // already checked above - so it decrements immediately and skips
    // "pending" entirely instead of being invisible forever.
    if (paymentMethod === "cod") {
      await Promise.all(order.items.map((item) => this.bookRepository.decrementStock(item.bookId, item.quantity)));
      const confirmed = await this.orderRepository.updateStatus(order.id, "confirmed");
      order = confirmed ?? order;
    }

    await this.cartRepository.clear(userId);

    return { order, whatsappUrl: buildWhatsAppUrl(whatsappMessage, env.WHATSAPP_NUMBER) };
  }

  // COD-only: Razorpay-paid orders can't be self-cancelled (the frontend
  // shows a "chat with admin" link for those instead, since a refund needs
  // a human) - enforced here too, not just hidden in the UI.
  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError("Order not found");
    }
    if (order.paymentMethod !== "cod") {
      throw new ValidationError(
        "This order was paid online - please contact us to cancel it or request a refund"
      );
    }
    if (!isValidStatusTransition(order.status, "cancelled")) {
      throw new ValidationError(`This order can no longer be cancelled (it's already "${order.status}")`);
    }

    // COD stock is decremented immediately at order-creation time above,
    // not at a separate payment-capture step - so cancelling one always
    // needs to restore it, unconditionally (unlike the admin cancel path,
    // which only restores stock for orders that reached paymentStatus
    // "paid" - COD orders never do, by definition, so that guard alone
    // would silently skip restoring their stock).
    await Promise.all(order.items.map((item) => this.bookRepository.incrementStock(item.bookId, item.quantity)));

    const updated = await this.orderRepository.updateStatus(orderId, "cancelled");
    return updated!;
  }

  estimateDeliveryFee(address: GeocodableAddress): Promise<DeliveryEstimate> {
    return estimateDelivery(formatAddressForGeocoding(address));
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
