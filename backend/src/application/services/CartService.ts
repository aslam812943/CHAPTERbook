import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { IOfferRepository } from "../../domain/repositories/IOfferRepository";
import { Cart, CartItemView, CartView } from "../../domain/entities/Cart";
import { ValidationError } from "../../shared/errors/AppError";
import { computeEffectivePricing } from "../../shared/utils/offerPricing";

export class CartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly bookRepository: IBookRepository,
    private readonly offerRepository: IOfferRepository
  ) {}

  async getCart(userId: string): Promise<CartView> {
    const cart = await this.cartRepository.findByUserId(userId);
    return this.toView(cart);
  }

  async addItem(userId: string, bookId: string, quantity: number): Promise<CartView> {
    if (quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }

    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new ValidationError("Book not found");
    }

    const existingCart = await this.cartRepository.findByUserId(userId);
    const existingQuantity = existingCart?.items.find((item) => item.bookId === bookId)?.quantity ?? 0;
    if (existingQuantity + quantity > book.stock) {
      throw new ValidationError(`Only ${book.stock} in stock`);
    }

    const cart = await this.cartRepository.addItem(userId, bookId, quantity);
    return this.toView(cart);
  }

  async updateItemQuantity(userId: string, bookId: string, quantity: number): Promise<CartView> {
    if (quantity < 0) {
      throw new ValidationError("Quantity cannot be negative");
    }

    if (quantity > 0) {
      const book = await this.bookRepository.findById(bookId);
      if (!book) {
        throw new ValidationError("Book not found");
      }
      if (quantity > book.stock) {
        throw new ValidationError(`Only ${book.stock} in stock`);
      }
    }

    const cart =
      quantity === 0
        ? await this.cartRepository.removeItem(userId, bookId)
        : await this.cartRepository.setItemQuantity(userId, bookId, quantity);

    return this.toView(cart);
  }

  async removeItem(userId: string, bookId: string): Promise<CartView> {
    const cart = await this.cartRepository.removeItem(userId, bookId);
    return this.toView(cart);
  }

  async clear(userId: string): Promise<void> {
    await this.cartRepository.clear(userId);
  }

  private async toView(cart: Cart | null): Promise<CartView> {
    if (!cart || cart.items.length === 0) {
      return { items: [], total: 0 };
    }

    const [books, activeOffers] = await Promise.all([
      Promise.all(cart.items.map((item) => this.bookRepository.findById(item.bookId))),
      this.offerRepository.findActive(),
    ]);

    const items: CartItemView[] = [];
    for (let i = 0; i < cart.items.length; i++) {
      const book = books[i];
      if (!book) continue; // book was deleted after being added to the cart
      const { effectiveDiscountPercentage, effectiveFinalPrice } = computeEffectivePricing(book, activeOffers);
      items.push({
        bookId: cart.items[i].bookId,
        quantity: cart.items[i].quantity,
        title: book.title,
        price: effectiveFinalPrice,
        originalPrice: book.price,
        discountPercentage: effectiveDiscountPercentage,
        coverImageUrl: book.coverImageUrl,
        stock: book.stock,
      });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, total };
  }
}
