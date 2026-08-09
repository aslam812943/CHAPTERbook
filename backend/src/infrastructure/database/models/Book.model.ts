import { Schema, model, Document, Types } from "mongoose";
import { BookSource } from "../../../domain/entities/Book";

export interface BookDocument extends Document<Types.ObjectId> {
  title: string;
  slug: string;
  authors: string[];
  description: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  coverImageUrl?: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stock: number;
  categoryIds: Types.ObjectId[];
  language: string;
  source: BookSource;
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<BookDocument>(
  {
    title: { type: String, required: true, trim: true },
    // sparse (not just unique): existing books get backfilled a slug via a
    // one-time migration, but sparse means the index won't choke on the
    // brief window before that runs where multiple documents still have no
    // slug at all (a plain unique index treats missing values as
    // colliding nulls).
    slug: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true },
    authors: { type: [String], default: [] },
    description: { type: String, default: "" },
    isbn10: { type: String },
    isbn13: { type: String },
    publisher: { type: String },
    publishedDate: { type: String },
    pageCount: { type: Number },
    coverImageUrl: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Multikey index - queried on every category filter (shop page,
    // category browse) and every "related books" lookup on the book detail
    // page (findMany({ categoryId })).
    categoryIds: { type: [Schema.Types.ObjectId], ref: "Category", default: [], index: true },
    language: { type: String, required: true, trim: true, default: "English" },
    source: { type: String, enum: ["google", "openlibrary", "manual"], default: "manual" },
    sourceId: { type: String },
  },
  { timestamps: true }
);

// `language_override` is required here: MongoDB text indexes reserve a
// top-level field literally named "language" for per-document stemming
// overrides by default, which collides with our own "language" field
// (the book's actual language, e.g. Malayalam/English) - without this,
// $text queries throw "language override unsupported" for any value that
// isn't one of Mongo's supported stemming languages.
bookSchema.index(
  { title: "text", authors: "text", description: "text" },
  { language_override: "textSearchLanguage" }
);

export const BookModel = model<BookDocument>("Book", bookSchema);
