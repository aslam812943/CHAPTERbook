import { Types } from "mongoose";
import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Cart } from "../../domain/entities/Cart";
import { CartDocument, CartItemSubdocument, CartModel } from "../database/models/Cart.model";

function toDomain(doc: CartDocument): Cart {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    items: doc.items.map((item: CartItemSubdocument) => ({
      bookId: item.bookId.toString(),
      quantity: item.quantity,
    })),
    updatedAt: doc.updatedAt,
  };
}

export class MongoCartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    const doc = await CartModel.findOne({ userId }).lean<CartDocument>();
    return doc ? toDomain(doc) : null;
  }

  async addItem(userId: string, bookId: string, quantity: number): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId, "items.bookId": bookId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true }
    ).lean<CartDocument>();

    if (doc) return toDomain(doc);

    const upserted = await CartModel.findOneAndUpdate(
      { userId },
      { $push: { items: { bookId: new Types.ObjectId(bookId), quantity } } },
      { new: true, upsert: true }
    ).lean<CartDocument>();

    return toDomain(upserted!);
  }

  async setItemQuantity(userId: string, bookId: string, quantity: number): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId, "items.bookId": bookId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, upsert: false }
    ).lean<CartDocument>();

    if (doc) return toDomain(doc);

    const upserted = await CartModel.findOneAndUpdate(
      { userId },
      { $push: { items: { bookId: new Types.ObjectId(bookId), quantity } } },
      { new: true, upsert: true }
    ).lean<CartDocument>();

    return toDomain(upserted!);
  }

  async removeItem(userId: string, bookId: string): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { bookId } } },
      { new: true, upsert: true }
    ).lean<CartDocument>();
    return toDomain(doc!);
  }

  async clear(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true });
  }
}
