import { Request, Response } from "express";
import { BookRequestService } from "../../application/services/BookRequestService";

export class BookRequestController {
  constructor(private readonly bookRequestService: BookRequestService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { bookTitle, authorName, note } = req.body as {
      bookTitle: string;
      authorName?: string;
      note?: string;
    };
    const bookRequest = await this.bookRequestService.create(req.user!.sub, bookTitle, authorName, note);
    res.status(201).json({ bookRequest });
  };

  listMine = async (req: Request, res: Response): Promise<void> => {
    const bookRequests = await this.bookRequestService.listMine(req.user!.sub);
    res.json({ bookRequests });
  };

  unseen = async (req: Request, res: Response): Promise<void> => {
    const bookRequests = await this.bookRequestService.unseenFulfilled(req.user!.sub);
    res.json({ bookRequests });
  };

  markSeen = async (req: Request, res: Response): Promise<void> => {
    await this.bookRequestService.markSeen(req.user!.sub);
    res.status(204).send();
  };
}
