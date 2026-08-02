import { Schema, model, Document, Types } from "mongoose";
import { OfferScopeType } from "../../../domain/entities/Offer";

export interface OfferDocument extends Document<Types.ObjectId> {
  name: string;
  scopeType: OfferScopeType;
  categoryId?: Types.ObjectId;
  bookId?: Types.ObjectId;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<OfferDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    scopeType: { type: String, enum: ["all", "category", "product"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    // Queried on every homepage/shop load (findActive({ isActive: true })).
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

export const OfferModel = model<OfferDocument>("Offer", offerSchema);
