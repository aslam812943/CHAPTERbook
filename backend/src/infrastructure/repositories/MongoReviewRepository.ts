import { Types } from "mongoose";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository";
import { CreateReviewInput, RatingValue, Review } from "../../domain/entities/Review";
import { ReviewDocument, ReviewModel } from "../database/models/Review.model";

function toDomain(doc: ReviewDocument): Review {
  return {
    id: doc._id.toString(),
    bookId: doc.bookId.toString(),
    userId: doc.userId.toString(),
    userName: doc.userName,
    title: doc.title,
    rating: doc.rating as RatingValue,
    body: doc.body,
    createdAt: doc.createdAt,
  };
}

export class MongoReviewRepository implements IReviewRepository {
  async findByBookId(bookId: string): Promise<Review[]> {
    const docs = await ReviewModel.find({ bookId }).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<Review | null> {
    const doc = await ReviewModel.findOne({ userId, bookId });
    return doc ? toDomain(doc) : null;
  }

  async create(input: CreateReviewInput): Promise<Review> {
    const doc = await ReviewModel.create({
      bookId: new Types.ObjectId(input.bookId),
      userId: new Types.ObjectId(input.userId),
      userName: input.userName,
      title: input.title,
      rating: input.rating,
      body: input.body,
    });
    return toDomain(doc);
  }
}
