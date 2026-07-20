import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { Order, OrderStatus, PaginatedResult, Pagination } from "../../domain/entities/Order";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { isValidStatusTransition } from "../../shared/utils/orderStatus";

export class AdminOrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

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

    const updated = await this.orderRepository.updateStatus(orderId, status);
    return updated!;
  }
}
