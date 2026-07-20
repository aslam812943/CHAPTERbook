import { IReviewRepository } from "../../domain/repositories/IReviewRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { RatingValue, Review, ReviewSummary } from "../../domain/entities/Review";
import { ConflictError, ValidationError } from "../../shared/errors/AppError";

export class ReviewService {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async getSummary(bookId: string): Promise<ReviewSummary> {
    const reviews = await this.reviewRepository.findByBookId(bookId);
    const total = reviews.length;
    const breakdown: Record<RatingValue, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const review of reviews) {
      breakdown[review.rating]++;
    }

    const average = total === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    return { average, total, breakdown, reviews };
  }

  async createReview(
    userId: string,
    bookId: string,
    rating: RatingValue,
    title: string,
    body: string
  ): Promise<Review> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new ValidationError("Book not found");
    }

    const existing = await this.reviewRepository.findByUserAndBook(userId, bookId);
    if (existing) {
      throw new ConflictError("You have already reviewed this book");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    return this.reviewRepository.create({ bookId, userId, userName: user.name, rating, title, body });
  }
}
