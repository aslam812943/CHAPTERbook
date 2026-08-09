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
import { slugify } from "../../shared/utils/slugify";
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

  // Unlike Category/Author (which reject a duplicate name outright - see
  // CategoryService/AuthorService), two unrelated books can legitimately
  // share a title (different editions, or just coincidence), so this
  // disambiguates instead of failing the save: title, title-2, title-3...
  // `excludeId` lets an update keep its own existing slug instead of
  // colliding with itself when the title didn't actually change meaning.
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;
    while (true) {
      const owner = await this.bookRepository.findBySlug(candidate);
      if (!owner || owner.id === excludeId) return candidate;
      candidate = `${base}-${suffix}`;
      suffix++;
    }
  }

  async create(input: CreateBookInput): Promise<Book> {
    const discountPercentage = input.discountPercentage ?? 0;
    const slug = await this.generateUniqueSlug(input.title);
    const book = await this.bookRepository.create({
      ...input,
      slug,
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

  async getBySlug(slug: string): Promise<Book> {
    const book = await this.bookRepository.findBySlug(slug);
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

    const needsExisting =
      input.price !== undefined || input.discountPercentage !== undefined || input.title !== undefined;

    if (needsExisting) {
      const existing = await this.bookRepository.findById(id);
      if (!existing) {
        throw new NotFoundError("Book not found");
      }

      patch = { ...input };

      if (input.price !== undefined || input.discountPercentage !== undefined) {
        const price = input.price ?? existing.price;
        const discountPercentage = input.discountPercentage ?? existing.discountPercentage;
        patch.price = price;
        patch.discountPercentage = discountPercentage;
        patch.finalPrice = computeFinalPrice(price, discountPercentage);
      }

      // Regenerate the slug so the public URL stays in sync with the title -
      // otherwise a renamed book keeps serving under its old, now-stale
      // slug forever. excludeId lets this collide with the book's own
      // current slug without endlessly appending -2, -3... to itself.
      if (input.title !== undefined && input.title !== existing.title) {
        patch.slug = await this.generateUniqueSlug(input.title, id);
      }
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
