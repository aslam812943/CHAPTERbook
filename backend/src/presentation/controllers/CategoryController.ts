import { Request, Response } from "express";
import { CategoryService } from "../../application/services/CategoryService";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, description, imageUrl } = req.body;
    const category = await this.categoryService.create(name, description, imageUrl);
    res.status(201).json({ category });
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.list();
    res.json({ categories });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { name, description, imageUrl } = req.body;
    const category = await this.categoryService.update(req.params.id, { name, description, imageUrl });
    res.json({ category });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.categoryService.delete(req.params.id);
    res.status(204).send();
  };
}
