export type OfferScopeType = "all" | "category" | "product";

export interface Offer {
  id: string;
  name: string;
  scopeType: OfferScopeType;
  categoryId?: string;
  bookId?: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
