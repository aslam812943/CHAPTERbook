import { Request, Response } from "express";
import { BookRequestService } from "../../application/services/BookRequestService";
import { BookRequestStatus } from "../../domain/entities/BookRequest";

export class AdminBookRequestController {
  constructor(private readonly bookRequestService: BookRequestService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query as unknown as { status?: BookRequestStatus };
    const bookRequests = await this.bookRequestService.listAll(status);
    res.json({ bookRequests });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { status, adminNote, bookId } = req.body as {
      status: BookRequestStatus;
      adminNote?: string;
      bookId?: string;
    };
    const bookRequest = await this.bookRequestService.updateStatus(req.params.id, status, adminNote, bookId);
    res.json({ bookRequest });
  };
}
