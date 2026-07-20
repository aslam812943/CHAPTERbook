import { Request, Response } from "express";
import { OrderService } from "../../application/services/OrderService";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const result = await this.orderService.createOrder(req.user!.sub, req.body.address);
    res.status(201).json(result);
  };

  listMyOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await this.orderService.listForUser(req.user!.sub);
    res.json({ orders });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const order = await this.orderService.getById(req.user!.sub, req.params.id);
    res.json({ order });
  };
}
