import { Wishlist } from "../entities/Wishlist";

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<Wishlist | null>;
  addBook(userId: string, bookId: string): Promise<Wishlist>;
  removeBook(userId: string, bookId: string): Promise<Wishlist>;
}
