import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Order, OrderStatus, PaginatedResult, Pagination } from "../../domain/entities/Order";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { isValidStatusTransition } from "../../shared/utils/orderStatus";
import { buildCsv } from "../../shared/utils/csv";

const EXPORT_CSV_HEADERS = [
  "Order Ref",
  "Date",
  "Customer Name",
  "Phone",
  "Items",
  "Items Total",
  "Delivery Fee",
  "Total Amount",
  "Payment Method",
  "Payment Status",
  "Order Status",
  "Address",
  "City",
  "Postal Code",
  "Country",
];

export class AdminOrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  listAll(pagination: Pagination): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findAll(pagination);
  }

  async exportOrdersCsv(): Promise<string> {
    const orders = await this.orderRepository.findAllForExport();

    const rows = orders.map((order) => [
      order.orderRef,
      order.createdAt.toISOString(),
      order.deliveryAddressSnapshot.fullName,
      order.deliveryAddressSnapshot.phone,
      order.items.map((item) => `${item.title} x${item.quantity}`).join("; "),
      // itemsTotal/deliveryFee didn't exist before the delivery-fee feature
      // shipped - orders placed before that have neither field in the
      // database at all, not just zero, so they need an explicit fallback
      // rather than crashing the whole export over a handful of old rows.
      (order.itemsTotal ?? order.totalAmount).toFixed(2),
      (order.deliveryFee ?? 0).toFixed(2),
      order.totalAmount.toFixed(2),
      order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)",
      order.paymentStatus,
      order.status,
      order.deliveryAddressSnapshot.addressLine,
      order.deliveryAddressSnapshot.city,
      order.deliveryAddressSnapshot.postalCode ?? "",
      order.deliveryAddressSnapshot.country,
    ]);

    return buildCsv(EXPORT_CSV_HEADERS, rows);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (!isValidStatusTransition(order.status, status)) {
      throw new ValidationError(`Cannot move an order from "${order.status}" to "${status}"`);
    }

    // "cancelled" is a terminal state (no transitions out of it - see
    // orderStatus.ts), so this can only ever run once per order - no risk
    // of crediting stock back twice for the same cancellation. Only
    // restores stock that was actually decremented: Razorpay orders
    // decrement at payment-capture time (paymentStatus "paid"), while COD
    // orders decrement immediately at creation regardless of paymentStatus
    // (see OrderService.createOrder) - so both need to be covered here, not
    // just the "paid" check alone.
    if (status === "cancelled" && (order.paymentStatus === "paid" || order.paymentMethod === "cod")) {
      await Promise.all(order.items.map((item) => this.bookRepository.incrementStock(item.bookId, item.quantity)));
    }

    const updated = await this.orderRepository.updateStatus(orderId, status);
    return updated!;
  }
}
