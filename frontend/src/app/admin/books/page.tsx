import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Book, PaginatedResult } from "@/types/book";
import BookRowActions from "@/components/admin/BookRowActions";
import PriceDisplay from "@/components/PriceDisplay";

export default async function AdminBooksPage() {
  await requireAdmin();

  const { items: books, total } = await apiClient.get<PaginatedResult<Book>>("/books?limit=100");

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">Catalog</h1>
            <p className="text-gray-400">{total} book{total === 1 ? "" : "s"} in the store</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
              &larr; Dashboard
            </Link>
            <Link
              href="/admin/books/import"
              className="bg-accent text-[#111] font-semibold px-5 py-2.5 rounded-md hover:brightness-110 transition-all"
            >
              + Add Book
            </Link>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            No books yet.{" "}
            <Link href="/admin/books/import" className="text-accent hover:underline">
              Add your first one
            </Link>
            .
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl divide-y divide-gray-800 overflow-hidden">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                    {book.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0 sm:w-48">
                    <p className="font-semibold text-[#F4F3EE] truncate">{book.title}</p>
                    <p className="text-sm text-gray-500 truncate">{book.authors.join(", ") || "Unknown author"}</p>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 sm:gap-4 pl-16 sm:pl-0">
                  <PriceDisplay
                    price={book.price}
                    discountPercentage={book.discountPercentage}
                    finalPrice={book.finalPrice}
                    className="sm:w-28 sm:justify-end text-right text-sm flex-wrap"
                  />

                  <Link
                    href={`/admin/books/${book.id}/edit`}
                    className="text-xs font-medium px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors"
                  >
                    Edit
                  </Link>

                  <BookRowActions bookId={book.id} stock={book.stock} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
