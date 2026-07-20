import { IWishlistRepository } from "../../domain/repositories/IWishlistRepository";
import { Wishlist } from "../../domain/entities/Wishlist";
import { WishlistDocument, WishlistModel } from "../database/models/Wishlist.model";

function toDomain(doc: WishlistDocument): Wishlist {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    bookIds: doc.bookIds.map((id) => id.toString()),
    updatedAt: doc.updatedAt,
  };
}

export class MongoWishlistRepository implements IWishlistRepository {
  async findByUserId(userId: string): Promise<Wishlist | null> {
    const doc = await WishlistModel.findOne({ userId });
    return doc ? toDomain(doc) : null;
  }

  async addBook(userId: string, bookId: string): Promise<Wishlist> {
    const doc = await WishlistModel.findOneAndUpdate(
      { userId },
      { $addToSet: { bookIds: bookId } },
      { new: true, upsert: true }
    );
    return toDomain(doc);
  }

  async removeBook(userId: string, bookId: string): Promise<Wishlist> {
    const doc = await WishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { bookIds: bookId } },
      { new: true, upsert: true }
    );
    return toDomain(doc);
  }
}
