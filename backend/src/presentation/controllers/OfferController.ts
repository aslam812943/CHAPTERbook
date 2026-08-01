import { Request, Response } from "express";
import { OfferService } from "../../application/services/OfferService";

export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const offer = await this.offerService.create(req.body);
    res.status(201).json({ offer });
  };

  listAll = async (_req: Request, res: Response): Promise<void> => {
    const offers = await this.offerService.listAll();
    res.json({ offers });
  };

  listActive = async (_req: Request, res: Response): Promise<void> => {
    const offers = await this.offerService.listActive();
    res.json({ offers });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const offer = await this.offerService.update(req.params.id, req.body);
    res.json({ offer });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.offerService.delete(req.params.id);
    res.status(204).send();
  };
}
