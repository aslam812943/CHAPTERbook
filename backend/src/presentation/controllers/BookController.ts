import { Request, Response } from "express";
import { BookService } from "../../application/services/BookService";

export class BookController {
  constructor(private readonly bookService: BookService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const book = await this.bookService.create(req.body);
    res.status(201).json({ book });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const book = await this.bookService.getById(req.params.id);
    res.json({ book });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { search, categoryId, language, page, limit } = req.query as unknown as {
      search?: string;
      categoryId?: string;
      language?: string;
      page: number;
      limit: number;
    };
    const result = await this.bookService.list({ search, categoryId, language }, { page, limit });
    res.json(result);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const book = await this.bookService.update(req.params.id, req.body);
    res.json({ book });
  };

  adjustStock = async (req: Request, res: Response): Promise<void> => {
    const book = await this.bookService.adjustStock(req.params.id, req.body.stock);
    res.json({ book });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.bookService.delete(req.params.id);
    res.status(204).send();
  };
}
