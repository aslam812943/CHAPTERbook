import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { IOfferRepository } from "../../domain/repositories/IOfferRepository";
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
import { computeEffectivePricing } from "../../shared/utils/offerPricing";
import { AuthorService } from "./AuthorService";

export class BookService {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly authorService: AuthorService,
    private readonly offerRepository: IOfferRepository
  ) {}

  private async withEffectivePricing(book: Book): Promise<Book> {
    const activeOffers = await this.offerRepository.findActive();
    return { ...book, ...computeEffectivePricing(book, activeOffers) };
  }

  private async withEffectivePricingMany(books: Book[]): Promise<Book[]> {
    const activeOffers = await this.offerRepository.findActive();
    return books.map((book) => ({ ...book, ...computeEffectivePricing(book, activeOffers) }));
  }

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
    return this.withEffectivePricing(book);
  }

  async getById(id: string): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError("Book not found");
    }
    return this.withEffectivePricing(book);
  }

  async list(filter: BookFilter, pagination: Pagination): Promise<PaginatedResult<Book>> {
    const result = await this.bookRepository.findMany(filter, pagination);
    const items = await this.withEffectivePricingMany(result.items);
    return { ...result, items };
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

    return this.withEffectivePricing(book);
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
