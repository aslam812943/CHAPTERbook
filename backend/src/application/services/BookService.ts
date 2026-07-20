import { IBookRepository } from "../../domain/repositories/IBookRepository";
import {
  Book,
  BookFilter,
  CreateBookInput,
  PaginatedResult,
  Pagination,
  UpdateBookInput,
} from "../../domain/entities/Book";
import { NotFoundError } from "../../shared/errors/AppError";
import { computeFinalPrice } from "../../shared/utils/pricing";
import { AuthorService } from "./AuthorService";

export class BookService {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly authorService: AuthorService
  ) {}

  async create(input: CreateBookInput): Promise<Book> {
    const discountPercentage = input.discountPercentage ?? 0;
    const book = await this.bookRepository.create({
      ...input,
      discountPercentage,
      finalPrice: computeFinalPrice(input.price, discountPercentage),
    });
    // Fire-and-forget from the caller's perspective isn't appropriate here
    // (we want a real directory, not a best-effort one) but a failure here
    // shouldn't roll back an otherwise-successful book save - log and move on.
    await this.authorService.ensureAuthorsExist(input.authors).catch((err) => {
      console.error("Failed to auto-create authors for book", book.id, err);
    });
    return book;
  }

  async getById(id: string): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError("Book not found");
    }
    return book;
  }

  list(filter: BookFilter, pagination: Pagination): Promise<PaginatedResult<Book>> {
    return this.bookRepository.findMany(filter, pagination);
  }

  async update(id: string, input: UpdateBookInput): Promise<Book> {
    let patch = input;

    if (input.price !== undefined || input.discountPercentage !== undefined) {
      const existing = await this.bookRepository.findById(id);
      if (!existing) {
        throw new NotFoundError("Book not found");
      }
      const price = input.price ?? existing.price;
      const discountPercentage = input.discountPercentage ?? existing.discountPercentage;
      patch = { ...input, price, discountPercentage, finalPrice: computeFinalPrice(price, discountPercentage) };
    }

    const book = await this.bookRepository.update(id, patch);
    if (!book) {
      throw new NotFoundError("Book not found");
    }

    if (input.authors) {
      await this.authorService.ensureAuthorsExist(input.authors).catch((err) => {
        console.error("Failed to auto-create authors for book", book.id, err);
      });
    }

    return book;
  }

  async adjustStock(id: string, stock: number): Promise<Book> {
    return this.update(id, { stock });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.bookRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Book not found");
    }
  }
}
