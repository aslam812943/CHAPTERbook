import { CreateOrderInput, Order, OrderStatus, PaginatedResult, Pagination } from "../entities/Order";

export interface IOrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findRecentByUserAndTotal(userId: string, totalAmount: number, withinMs: number): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
  findAll(pagination: Pagination): Promise<PaginatedResult<Order>>;
}
