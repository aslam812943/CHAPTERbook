import { apiClient } from "@/lib/dal/apiClient";
import { Book, PaginatedResult } from "@/types/book";
import { Category } from "@/types/category";
import { Offer } from "@/types/offer";
import { ReviewSummary } from "@/types/review";
import { Author } from "@/types/author";
import LibraryShelf from "@/components/shop/LibraryShelf";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ author?: string; offer?: string }>;
}) {
  const { author: authorFilter, offer: offerFilter } = await searchParams;

  // Filtering/sorting happens client-side in LibraryShelf so it can animate
  // books sliding on/off the shelves - that needs the full catalog in the
  // browser rather than a fresh server round-trip per filter change. Fine
  // at this catalog size; would need real pagination if it grows large.
  const [{ items: books }, { categories }, { authors }, { offers }] = await Promise.all([
    apiClient.get<PaginatedResult<Book>>("/books?limit=100"),
    apiClient.get<{ categories: Category[] }>("/categories"),
    apiClient.get<{ authors: Author[] }>("/authors"),
    apiClient.get<{ offers: Offer[] }>("/offers/active"),
  ]);

  const authorInfo = authorFilter
    ? authors.find((a) => a.name.trim().toLowerCase() === authorFilter.trim().toLowerCase()) ?? null
    : null;

  // One request per book is fine at this catalog size (a handful of
  // titles); would need a batch ratings endpoint if the catalog grows
  // large enough for this to matter.
  const summaries = await Promise.all(
    books.map((book) =>
      apiClient
        .get<{ summary: ReviewSummary }>(`/reviews?bookId=${book.id}`)
        .then((res) => res.summary)
        .catch(() => null)
    )
  );

  const booksWithRatings: Book[] = books.map((book, i) => {
    const summary = summaries[i];
    if (!summary || summary.total === 0) return book;
    return { ...book, avgRating: summary.average, reviewCount: summary.total };
  });

  return (
    <LibraryShelf
      books={booksWithRatings}
      categories={categories}
      authorFilter={authorFilter ?? null}
      authorInfo={authorInfo}
      offers={offers}
      offerFilter={offerFilter ?? null}
    />
  );
}
