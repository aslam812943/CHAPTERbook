import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { apiClient } from "@/lib/dal/apiClient";
import { Book, PaginatedResult } from "@/types/book";
import BookMarquee from "@/components/BookMarquee";
import SectionEyebrow from "@/components/SectionEyebrow";

// Declared here (not the root layout) so it's only preloaded/downloaded on
// pages that actually render this component - see layout.tsx.
const playfairDisplayBold = Playfair_Display({ subsets: ["latin"], weight: "700" });

export default async function BestSellers() {
  // There's no order/sales tracking to rank by yet, so this shows the
  // catalog reversed from the "Latest Additions" order (oldest-first)
  // purely for visual variety between the two showcase rows, not as a
  // real popularity ranking.
  const { items } = await apiClient.get<PaginatedResult<Book>>("/books?limit=6", { revalidate: 300 });
  const books = [...items].reverse();

  if (books.length === 0) return null;

  return (
    <section className="bg-paper px-6 md:px-8 pt-10 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <SectionEyebrow className="mb-4">Reader Favorites</SectionEyebrow>
            <h2 className={`text-3xl md:text-4xl font-bold not-italic text-ink ${playfairDisplayBold.className}`}>
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm text-ink/70 hover:text-accent transition-colors whitespace-nowrap"
          >
            Browse the full collection &rarr;
          </Link>
        </div>

        <BookMarquee books={books} direction="right" />
      </div>
    </section>
  );
}
