import { Request, Response } from "express";
import { AdminOrderService } from "../../application/services/AdminOrderService";

export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await this.adminOrderService.listAll({ page, limit });
    res.json(result);
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const order = await this.adminOrderService.updateStatus(req.params.id, req.body.status);
    res.json({ order });
  };
}
