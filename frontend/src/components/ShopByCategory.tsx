import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { apiClient } from "@/lib/dal/apiClient";
import { Book, PaginatedResult } from "@/types/book";
import { Category } from "@/types/category";
import SectionEyebrow from "@/components/SectionEyebrow";
import CategoryCard from "@/components/CategoryCard";

// Declared here (not the root layout) so it's only preloaded/downloaded on
// pages that actually render this component - see layout.tsx.
const playfairDisplayBold = Playfair_Display({ subsets: ["latin"], weight: "700" });

interface CategoryCardData {
  id: string;
  name: string;
  count: number;
  coverImageUrl?: string;
}

export default async function ShopByCategory() {
  const [{ categories }, { items: books }] = await Promise.all([
    apiClient.get<{ categories: Category[] }>("/categories", { revalidate: 300 }),
    apiClient.get<PaginatedResult<Book>>("/books?limit=100", { revalidate: 300 }),
  ]);

  if (categories.length === 0) return null;

  // Prefer the admin-set category image; if none was set, fall back to the
  // cover of the first book in that category instead of leaving the card
  // blank.
  const cards: CategoryCardData[] = categories.map((category) => {
    const inCategory = books.filter((book) => book.categoryIds.includes(category.id));
    return {
      id: category.id,
      name: category.name,
      count: inCategory.length,
      coverImageUrl: category.imageUrl ?? inCategory.find((book) => book.coverImageUrl)?.coverImageUrl,
    };
  });

  return (
    <section id="categories" className="bg-paper px-6 md:px-8 pt-24 pb-10 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionEyebrow className="mb-4">Browse</SectionEyebrow>
            <h2 className={`text-3xl md:text-4xl font-bold not-italic text-ink ${playfairDisplayBold.className}`}>
              Shop By Categories
            </h2>
            <p className="text-gray-600 mt-3 max-w-md">Explore our top picks, sorted by what you love to read.</p>
          </div>
          <Link href="/shop" className="text-sm text-ink/70 hover:text-accent transition-colors whitespace-nowrap">
            View all Categories &rarr;
          </Link>
        </div>

        <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:snap-none sm:pb-0 md:grid-cols-6">
          {cards.map((card) => (
            <CategoryCard
              key={card.id}
              categoryId={card.id}
              name={card.name}
              count={card.count}
              coverImageUrl={card.coverImageUrl}
              className="w-32 flex-shrink-0 snap-start sm:w-auto sm:flex-shrink sm:snap-none"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
