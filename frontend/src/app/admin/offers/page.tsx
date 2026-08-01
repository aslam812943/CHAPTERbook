import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Offer } from "@/types/offer";
import { Category } from "@/types/category";
import { Book, PaginatedResult } from "@/types/book";
import OfferManager from "@/components/admin/OfferManager";

export default async function AdminOffersPage() {
  await requireAdmin();

  const [{ offers }, { categories }, { items: books }] = await Promise.all([
    apiClient.get<{ offers: Offer[] }>("/offers", { auth: true }),
    apiClient.get<{ categories: Category[] }>("/categories"),
    apiClient.get<PaginatedResult<Book>>("/books?limit=100"),
  ]);

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">Offers</h1>
            <p className="text-gray-400">Promotional discounts across all products, a category, or one book.</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        <OfferManager offers={offers} categories={categories} books={books} />
      </div>
    </div>
  );
}
