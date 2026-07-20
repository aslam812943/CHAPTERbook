import { Schema, model, Document, Types } from "mongoose";

export interface AuthorDocument extends Document<Types.ObjectId> {
  name: string;
  slug: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<AuthorDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const AuthorModel = model<AuthorDocument>("Author", authorSchema);
