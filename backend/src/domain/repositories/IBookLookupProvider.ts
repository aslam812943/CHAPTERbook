export type BookLookupSource = "google" | "openlibrary";

export interface BookLookupResult {
  source: BookLookupSource;
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

export interface IBookLookupProvider {
  search(query: string): Promise<BookLookupResult[]>;
}
