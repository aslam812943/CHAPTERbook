import { Request, Response } from "express";
import { ReviewService } from "../../application/services/ReviewService";
import { RatingValue } from "../../domain/entities/Review";

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  getSummary = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.query as unknown as { bookId: string };
    const summary = await this.reviewService.getSummary(bookId);
    res.json({ summary });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { bookId, rating, title, body } = req.body as {
      bookId: string;
      rating: RatingValue;
      title: string;
      body: string;
    };
    const review = await this.reviewService.createReview(req.user!.sub, bookId, rating, title, body);
    res.status(201).json({ review });
  };
}
