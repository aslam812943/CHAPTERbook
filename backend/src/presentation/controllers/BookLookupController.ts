import { Request, Response } from "express";
import { BookLookupService } from "../../application/services/BookLookupService";

export class BookLookupController {
  constructor(private readonly bookLookupService: BookLookupService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query as unknown as { q: string };
    const results = await this.bookLookupService.search(q);
    res.json({ results });
  };
}
