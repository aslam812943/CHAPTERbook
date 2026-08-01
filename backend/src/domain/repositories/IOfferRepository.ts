import { CreateOfferInput, Offer, UpdateOfferInput } from "../entities/Offer";

export interface IOfferRepository {
  create(input: CreateOfferInput): Promise<Offer>;
  findAll(): Promise<Offer[]>;
  findActive(): Promise<Offer[]>;
  findById(id: string): Promise<Offer | null>;
  update(id: string, input: UpdateOfferInput): Promise<Offer | null>;
  delete(id: string): Promise<boolean>;
}
