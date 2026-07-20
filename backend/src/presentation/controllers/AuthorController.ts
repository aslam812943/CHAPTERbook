import { Request, Response } from "express";
import { AuthorService } from "../../application/services/AuthorService";

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name, imageUrl } = req.body;
    const author = await this.authorService.create(name, imageUrl);
    res.status(201).json({ author });
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const authors = await this.authorService.list();
    res.json({ authors });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { name, imageUrl } = req.body;
    const author = await this.authorService.update(req.params.id, { name, imageUrl });
    res.json({ author });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.authorService.delete(req.params.id);
    res.status(204).send();
  };
}
