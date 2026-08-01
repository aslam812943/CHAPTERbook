import { IWishlistRepository } from "../../domain/repositories/IWishlistRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { IOfferRepository } from "../../domain/repositories/IOfferRepository";
import { Wishlist, WishlistItemView, WishlistView } from "../../domain/entities/Wishlist";
import { ValidationError } from "../../shared/errors/AppError";
import { computeEffectivePricing } from "../../shared/utils/offerPricing";

export class WishlistService {
  constructor(
    private readonly wishlistRepository: IWishlistRepository,
    private readonly bookRepository: IBookRepository,
    private readonly offerRepository: IOfferRepository
  ) {}

  async getWishlist(userId: string): Promise<WishlistView> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);
    return this.toView(wishlist);
  }

  async addBook(userId: string, bookId: string): Promise<WishlistView> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new ValidationError("Book not found");
    }

    const wishlist = await this.wishlistRepository.addBook(userId, bookId);
    return this.toView(wishlist);
  }

  async removeBook(userId: string, bookId: string): Promise<WishlistView> {
    const wishlist = await this.wishlistRepository.removeBook(userId, bookId);
    return this.toView(wishlist);
  }

  private async toView(wishlist: Wishlist | null): Promise<WishlistView> {
    if (!wishlist || wishlist.bookIds.length === 0) {
      return { items: [] };
    }

    const [books, activeOffers] = await Promise.all([
      Promise.all(wishlist.bookIds.map((bookId) => this.bookRepository.findById(bookId))),
      this.offerRepository.findActive(),
    ]);

    const items: WishlistItemView[] = [];
    for (let i = 0; i < wishlist.bookIds.length; i++) {
      const book = books[i];
      if (!book) continue; // book was deleted after being wishlisted
      const { effectiveDiscountPercentage, effectiveFinalPrice } = computeEffectivePricing(book, activeOffers);
      items.push({
        bookId: wishlist.bookIds[i],
        title: book.title,
        price: effectiveFinalPrice,
        originalPrice: book.price,
        discountPercentage: effectiveDiscountPercentage,
        coverImageUrl: book.coverImageUrl,
        stock: book.stock,
      });
    }

    return { items };
  }
}
