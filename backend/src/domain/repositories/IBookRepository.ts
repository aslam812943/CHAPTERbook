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
  findMany(filter: BookFilter, pagination: Pagination): Promise<PaginatedResult<Book>>;
  update(id: string, input: UpdateBookInput): Promise<Book | null>;
  delete(id: string): Promise<boolean>;
}
