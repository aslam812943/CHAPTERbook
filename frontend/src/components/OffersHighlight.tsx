import Link from "next/link";
import { apiClient } from "@/lib/dal/apiClient";
import { Offer } from "@/types/offer";
import { Category } from "@/types/category";
import SectionEyebrow from "@/components/SectionEyebrow";

function scopeDescription(offer: Offer, categories: Category[]): string {
  if (offer.scopeType === "all") return "Storewide";
  if (offer.scopeType === "category") {
    return categories.find((c) => c.id === offer.categoryId)?.name ?? "Category";
  }
  return "Selected title";
}

export default async function OffersHighlight() {
  const [{ offers }, { categories }] = await Promise.all([
    apiClient.get<{ offers: Offer[] }>("/offers/active"),
    apiClient.get<{ categories: Category[] }>("/categories"),
  ]);

  // Nothing to show at all if there's no active promotion right now, rather
  // than rendering an empty section.
  if (offers.length === 0) return null;

  return (
    <section className="bg-paper px-6 md:px-8 pt-20 pb-4">
      <div className="max-w-6xl mx-auto">
        <SectionEyebrow className="mb-4">Limited Time</SectionEyebrow>
        <h2 className="text-3xl md:text-4xl font-heading font-bold not-italic text-ink mb-8">Current Offers</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/shop?offer=${offer.id}`}
              className="group relative overflow-hidden rounded-xl bg-ink text-paper p-6 hover:brightness-110 transition-all"
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-accent mb-2">
                {scopeDescription(offer, categories)}
              </span>
              <h3 className="text-xl font-serif italic mb-1">{offer.name}</h3>
              <p className="text-3xl font-extrabold text-accent">
                -{offer.discountPercentage}%
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-paper/70 group-hover:text-paper transition-colors">
                Shop this offer &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
