import { Schema, model, Document, Types } from "mongoose";

export interface ReviewDocument extends Document<Types.ObjectId> {
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  title: string;
  rating: number;
  body: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshotted at review time, same reasoning as Order's delivery address
    // snapshot - a later name change shouldn't rewrite what past reviewers
    // were called.
    userName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One review per user per book, enforced at the DB level as well as in
// ReviewService (the service check is what produces a friendly error
// message; this index is the backstop against races).
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export const ReviewModel = model<ReviewDocument>("Review", reviewSchema);
