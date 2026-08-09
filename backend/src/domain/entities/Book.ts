export type BookSource = "google" | "openlibrary" | "manual";

export type { Pagination, PaginatedResult } from "./common";

export interface Book {
  id: string;
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
  // Discount/price after any active offer is factored in - always populated,
  // equal to discountPercentage/finalPrice when no offer applies. Kept
  // separate from the book's own fields above (never overwritten) because
  // GET /books/:id is shared by both the public product page and the admin
  // edit form; mutating the "real" fields would risk an offer's discount
  // getting silently re-saved as the book's own permanent discount.
  effectiveDiscountPercentage: number;
  effectiveFinalPrice: number;
  stock: number;
  categoryIds: string[];
  language: string;
  source: BookSource;
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookInput {
  title: string;
  /** Computed by BookService from title (with a -2, -3... suffix on collision) - not client-supplied. */
  slug?: string;
  authors: string[];
  description: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  coverImageUrl?: string;
  price: number;
  discountPercentage?: number;
  /** Computed by BookService from price/discountPercentage - not client-supplied. */
  finalPrice?: number;
  stock: number;
  categoryIds?: string[];
  language?: string;
  source: BookSource;
  sourceId?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface BookFilter {
  search?: string;
  categoryId?: string;
  language?: string;
}

