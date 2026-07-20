import { Schema, model, Document, Types } from "mongoose";

export interface WishlistDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  bookIds: Types.ObjectId[];
  updatedAt: Date;
}

const wishlistSchema = new Schema<WishlistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bookIds: { type: [Schema.Types.ObjectId], ref: "Book", default: [] },
  },
  { timestamps: true }
);

export const WishlistModel = model<WishlistDocument>("Wishlist", wishlistSchema);
