import { CreateReviewInput, Review } from "../entities/Review";

export interface IReviewRepository {
  findByBookId(bookId: string): Promise<Review[]>;
  findByUserAndBook(userId: string, bookId: string): Promise<Review | null>;
  create(input: CreateReviewInput): Promise<Review>;
}
