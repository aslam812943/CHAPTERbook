export type BookSource = "google" | "openlibrary" | "manual";

export type { Pagination, PaginatedResult } from "./common";

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

