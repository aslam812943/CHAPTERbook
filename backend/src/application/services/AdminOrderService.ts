import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Order, OrderStatus, PaginatedResult, Pagination } from "../../domain/entities/Order";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { isValidStatusTransition } from "../../shared/utils/orderStatus";

export class AdminOrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  listAll(pagination: Pagination): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findAll(pagination);
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
    // restores stock that was actually decremented, i.e. only if the order
    // had been paid (unpaid orders never decremented anything).
    if (status === "cancelled" && order.paymentStatus === "paid") {
      await Promise.all(order.items.map((item) => this.bookRepository.incrementStock(item.bookId, item.quantity)));
    }

    const updated = await this.orderRepository.updateStatus(orderId, status);
    return updated!;
  }
}
