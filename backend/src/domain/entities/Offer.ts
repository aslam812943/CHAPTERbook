export type OfferScopeType = "all" | "category" | "product";

export interface Offer {
  id: string;
  name: string;
  scopeType: OfferScopeType;
  categoryId?: string;
  bookId?: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOfferInput {
  name: string;
  scopeType: OfferScopeType;
  categoryId?: string;
  bookId?: string;
  discountPercentage: number;
  isActive?: boolean;
}

export type UpdateOfferInput = Partial<CreateOfferInput>;
