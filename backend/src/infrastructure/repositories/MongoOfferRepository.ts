import { IOfferRepository } from "../../domain/repositories/IOfferRepository";
import { CreateOfferInput, Offer, UpdateOfferInput } from "../../domain/entities/Offer";
import { OfferDocument, OfferModel } from "../database/models/Offer.model";

function toDomain(doc: OfferDocument): Offer {
  return {
    id: doc._id.toString(),
    name: doc.name,
    scopeType: doc.scopeType,
    categoryId: doc.categoryId?.toString(),
    bookId: doc.bookId?.toString(),
    discountPercentage: doc.discountPercentage,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoOfferRepository implements IOfferRepository {
  async create(input: CreateOfferInput): Promise<Offer> {
    const doc = await OfferModel.create(input);
    return toDomain(doc);
  }

  async findAll(): Promise<Offer[]> {
    const docs = await OfferModel.find().sort({ createdAt: -1 }).lean<OfferDocument[]>();
    return docs.map(toDomain);
  }

  async findActive(): Promise<Offer[]> {
    const docs = await OfferModel.find({ isActive: true }).lean<OfferDocument[]>();
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Offer | null> {
    const doc = await OfferModel.findById(id).lean<OfferDocument>();
    return doc ? toDomain(doc) : null;
  }

  async update(id: string, input: UpdateOfferInput): Promise<Offer | null> {
    const doc = await OfferModel.findByIdAndUpdate(id, input, { new: true }).lean<OfferDocument>();
    return doc ? toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await OfferModel.findByIdAndDelete(id);
    return result !== null;
  }
}
