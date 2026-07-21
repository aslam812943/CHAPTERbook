import { Schema, model, Document, Types } from "mongoose";
import { BookRequestStatus } from "../../../domain/entities/BookRequest";

export interface BookRequestDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  requesterName: string;
  requesterEmail: string;
  bookTitle: string;
  authorName?: string;
  note?: string;
  status: BookRequestStatus;
  adminNote?: string;
  bookId?: Types.ObjectId;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookRequestSchema = new Schema<BookRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Snapshotted at request time, same reasoning as Order's delivery address
    // snapshot - a later profile-name change shouldn't rewrite past requests.
    requesterName: { type: String, required: true, trim: true },
    requesterEmail: { type: String, required: true, trim: true },
    bookTitle: { type: String, required: true, trim: true },
    authorName: { type: String, trim: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ["pending", "fulfilled", "rejected"], default: "pending", index: true },
    adminNote: { type: String, trim: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    seen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BookRequestModel = model<BookRequestDocument>("BookRequest", bookRequestSchema);
