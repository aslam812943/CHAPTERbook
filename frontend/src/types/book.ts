export type BookSource = "google" | "openlibrary" | "manual";

export interface Book {
  id: string;
  title: string;
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
  // Discount/price after any active offer is factored in - always present,
  // equal to discountPercentage/finalPrice when no offer applies. Use these
  // (not the raw fields above) anywhere customer-facing pricing is shown.
  effectiveDiscountPercentage: number;
  effectiveFinalPrice: number;
  stock: number;
  categoryIds: string[];
  language: string;
  source: BookSource;
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
  // Only populated where a page has already fetched review summaries (e.g.
  // the shop grid) - not part of the raw /books API response itself.
  avgRating?: number;
  reviewCount?: number;
}

export type { PaginatedResult } from "./common";

export interface BookLookupResult {
  source: BookSource;
  sourceId: string;
  title: string;
  authors: string[];
  description: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  thumbnail?: string;
  price?: number;
  language?: string;
}
