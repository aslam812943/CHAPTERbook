import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { getSession } from "@/lib/dal/session";
import { Book, PaginatedResult } from "@/types/book";
import { WishlistView } from "@/types/wishlist";
import { ReviewSummary } from "@/types/review";
import AddToCartButton from "@/components/books/AddToCartButton";
import WishlistButton from "@/components/books/WishlistButton";
import ReviewSummaryCard from "@/components/books/ReviewSummaryCard";
import ReviewForm from "@/components/books/ReviewForm";
import ReviewList from "@/components/books/ReviewList";
import PriceDisplay from "@/components/PriceDisplay";
import ShelfRow from "@/components/shop/ShelfRow";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";

// Pre-renders the known book IDs at build time; any book added afterward
// still works fine (dynamicParams defaults to true - it's just rendered
// on-demand on first visit instead of pre-built). Falls back to an empty
// list rather than failing the build if the Render backend is asleep or
// unreachable at build time.
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const { items } = await apiClient.get<PaginatedResult<Book>>("/books?limit=100");
    return items.map((book) => ({ id: book.id }));
  } catch {
    return [];
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Same URL + revalidate window as the page component's own fetch below,
    // so Next dedupes this into the same single request rather than
    // fetching the book twice.
    const { book } = await apiClient.get<{ book: Book }>(`/books/${id}`, { revalidate: 300 });
    const authors = book.authors.join(", ") || "Unknown author";
    const description = book.description
      ? truncate(book.description, 155)
      : `${book.title} by ${authors} - available now at Chapter Book Store.`;

    return {
      title: `${book.title} by ${authors}`,
      description,
      openGraph: {
        title: book.title,
        description,
        images: book.coverImageUrl ? [{ url: book.coverImageUrl }] : undefined,
      },
    };
  } catch {
    // A 404 here just falls through to the page component's own notFound()
    // handling below - no need to duplicate that logic for the metadata.
    return {};
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let book: Book;
  try {
    const response = await apiClient.get<{ book: Book }>(`/books/${id}`, { revalidate: 300 });
    book = response.book;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const session = await getSession();
  let wishlisted = false;
  if (session) {
    const { wishlist } = await apiClient.get<{ wishlist: WishlistView }>("/wishlist", { auth: true });
    wishlisted = wishlist.items.some((item) => item.bookId === book.id);
  }

  const { summary } = await apiClient.get<{ summary: ReviewSummary }>(`/reviews?bookId=${book.id}`, {
    revalidate: 60,
  });
  const alreadyReviewed = session ? summary.reviews.some((review) => review.userId === session.sub) : false;
  const reviewBlockedReason: "login" | "duplicate" | null = !session ? "login" : alreadyReviewed ? "duplicate" : null;

  let relatedBooks: Book[] = [];
  if (book.categoryIds.length > 0) {
    const { items } = await apiClient.get<PaginatedResult<Book>>(
      `/books?categoryId=${book.categoryIds[0]}&limit=9`,
      { revalidate: 300 }
    );
    relatedBooks = items.filter((b) => b.id !== book.id).slice(0, 8);
  }

  // Product structured data for rich search results (price, availability,
  // rating). JSON.stringify doesn't escape "</script>" sequences, which
  // would otherwise let a crafted description/title break out of the
  // script tag - < keeps the JSON valid while never rendering a
  // literal "<" into the HTML.
  const productJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    image: book.coverImageUrl ? [book.coverImageUrl] : undefined,
    description: book.description || undefined,
    ...(book.isbn13 || book.isbn10 ? { sku: book.isbn13 ?? book.isbn10 } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: book.effectiveFinalPrice,
      availability:
        book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(summary.total > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average,
            reviewCount: summary.total,
          },
        }
      : {}),
  }).replace(/</g, "\\u003c");

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLd }}
      />
      <div className="max-w-5xl mx-auto">
        <Link href="/shop" className="text-sm text-gray-500 hover:text-accent transition-colors">
          &larr; Back to shop
        </Link>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
          <div className="relative aspect-[2/3] w-full max-w-sm bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {book.coverImageUrl ? (
              <Image
                src={book.coverImageUrl}
                alt={book.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                unoptimized={!isOptimizableImageUrl(book.coverImageUrl)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No cover available</div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-3">{book.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{book.authors.join(", ") || "Unknown author"}</p>

            <div className="mb-8">
              <PriceDisplay
                price={book.price}
                discountPercentage={book.effectiveDiscountPercentage}
                finalPrice={book.effectiveFinalPrice}
                className="text-3xl"
              />
              {book.effectiveDiscountPercentage > 0 && book.effectiveDiscountPercentage !== book.discountPercentage && (
                <p className="mt-2 text-sm font-medium text-accent">Offer applied at checkout</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-1">
                <AddToCartButton bookId={book.id} stock={book.stock} isLoggedIn={!!session} />
              </div>
              <WishlistButton bookId={book.id} wishlisted={wishlisted} isLoggedIn={!!session} />
            </div>

            {book.description && (
              <p className="mt-10 text-gray-700 leading-relaxed whitespace-pre-line">{book.description}</p>
            )}

            <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 border-t border-gray-200 pt-6">
              {book.publisher && (
                <div>
                  <dt className="text-gray-500">Publisher</dt>
                  <dd className="text-gray-700">{book.publisher}</dd>
                </div>
              )}
              {book.publishedDate && (
                <div>
                  <dt className="text-gray-500">Published</dt>
                  <dd className="text-gray-700">{book.publishedDate}</dd>
                </div>
              )}
              {book.pageCount && (
                <div>
                  <dt className="text-gray-500">Pages</dt>
                  <dd className="text-gray-700">{book.pageCount}</dd>
                </div>
              )}
              {(book.isbn13 || book.isbn10) && (
                <div>
                  <dt className="text-gray-500">ISBN</dt>
                  <dd className="text-gray-700">{book.isbn13 ?? book.isbn10}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif italic text-ink mb-5">You Might Also Like</h2>
            <ShelfRow books={relatedBooks} />
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          <ReviewSummaryCard summary={summary} />
          <ReviewForm bookId={book.id} bookTitle={book.title} blockedReason={reviewBlockedReason} />
        </div>

        {summary.reviews.length > 0 && (
          <div className="mt-8">
            <ReviewList reviews={summary.reviews} />
          </div>
        )}
      </div>
    </div>
  );
}
