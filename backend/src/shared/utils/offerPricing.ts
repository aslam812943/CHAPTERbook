import { Offer } from "../../domain/entities/Offer";
import { computeFinalPrice } from "./pricing";

interface PricableBook {
  id: string;
  categoryIds: string[];
  price: number;
  discountPercentage: number;
}

// Most specific match wins: a product-scoped offer beats a category-scoped
// offer beats a site-wide "all" offer. Falls back to the book's own
// discount if no active offer covers it. Per product decision, an offer
// that does apply *replaces* the book's own discount rather than stacking
// with or only backfilling it.
export function resolveEffectiveDiscount(book: PricableBook, activeOffers: Offer[]): number {
  if (activeOffers.length === 0) return book.discountPercentage;

  const productOffer = activeOffers.find((o) => o.scopeType === "product" && o.bookId === book.id);
  if (productOffer) return productOffer.discountPercentage;

  const categoryOffer = activeOffers.find(
    (o) => o.scopeType === "category" && o.categoryId !== undefined && book.categoryIds.includes(o.categoryId)
  );
  if (categoryOffer) return categoryOffer.discountPercentage;

  const allOffer = activeOffers.find((o) => o.scopeType === "all");
  if (allOffer) return allOffer.discountPercentage;

  return book.discountPercentage;
}

// Deliberately separate from the book's own `discountPercentage`/`finalPrice`
// (never overwritten here) - those stay the book's true, admin-set values.
// `GET /books/:id` is shared by both the public product page and the admin
// edit form, so mutating the "real" fields would let an offer-inflated
// discount get silently re-saved as the book's own permanent discount the
// next time an admin submits the edit form without touching that field.
export function computeEffectivePricing(
  book: PricableBook,
  activeOffers: Offer[]
): { effectiveDiscountPercentage: number; effectiveFinalPrice: number } {
  const effectiveDiscountPercentage = resolveEffectiveDiscount(book, activeOffers);
  return {
    effectiveDiscountPercentage,
    effectiveFinalPrice: computeFinalPrice(book.price, effectiveDiscountPercentage),
  };
}
