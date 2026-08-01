import { IOfferRepository } from "../../domain/repositories/IOfferRepository";
import { CreateOfferInput, Offer, OfferScopeType, UpdateOfferInput } from "../../domain/entities/Offer";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";

export class OfferService {
  constructor(private readonly offerRepository: IOfferRepository) {}

  create(input: CreateOfferInput): Promise<Offer> {
    this.validateScope(input.scopeType, input.categoryId, input.bookId);
    return this.offerRepository.create(input);
  }

  listAll(): Promise<Offer[]> {
    return this.offerRepository.findAll();
  }

  listActive(): Promise<Offer[]> {
    return this.offerRepository.findActive();
  }

  async update(id: string, input: UpdateOfferInput): Promise<Offer> {
    if (input.scopeType) {
      this.validateScope(input.scopeType, input.categoryId, input.bookId);
    }

    const offer = await this.offerRepository.update(id, input);
    if (!offer) {
      throw new NotFoundError("Offer not found");
    }
    return offer;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.offerRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Offer not found");
    }
  }

  private validateScope(scopeType: OfferScopeType, categoryId?: string, bookId?: string): void {
    if (scopeType === "category" && !categoryId) {
      throw new ValidationError("Category is required for a category-scoped offer");
    }
    if (scopeType === "product" && !bookId) {
      throw new ValidationError("Product is required for a product-scoped offer");
    }
  }
}
