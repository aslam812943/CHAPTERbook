import { Schema, model, Document, Types } from "mongoose";

export interface CategoryDocument extends Document<Types.ObjectId> {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const CategoryModel = model<CategoryDocument>("Category", categorySchema);
