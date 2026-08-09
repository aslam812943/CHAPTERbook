import {
  Book,
  BookFilter,
  CreateBookInput,
  PaginatedResult,
  Pagination,
  UpdateBookInput,
} from "../entities/Book";

export interface IBookRepository {
  create(input: CreateBookInput): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  findBySlug(slug: string): Promise<Book | null>;
  findMany(filter: BookFilter, pagination: Pagination): Promise<PaginatedResult<Book>>;
  update(id: string, input: UpdateBookInput): Promise<Book | null>;
  delete(id: string): Promise<boolean>;
  // Atomic $inc operations (not read-then-write) so concurrent orders for
  // the same book can't race each other into an inconsistent stock count.
  decrementStock(bookId: string, quantity: number): Promise<void>;
  incrementStock(bookId: string, quantity: number): Promise<void>;
}
