import { Cart } from "../entities/Cart";

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  addItem(userId: string, bookId: string, quantity: number): Promise<Cart>;
  setItemQuantity(userId: string, bookId: string, quantity: number): Promise<Cart>;
  removeItem(userId: string, bookId: string): Promise<Cart>;
  clear(userId: string): Promise<void>;
}
