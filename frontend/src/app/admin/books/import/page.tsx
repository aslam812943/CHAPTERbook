import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Category } from "@/types/category";
import BookImportPanel from "@/components/admin/BookImportPanel";

export default async function ImportBookPage() {
  await requireAdmin();

  const { categories } = await apiClient.get<{ categories: Category[] }>("/categories");

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">Add a Book</h1>
            <p className="text-gray-400">
              Search Google Books / Open Library, pick a match, then set price and stock.
            </p>
          </div>
          <Link href="/admin/books" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Back to catalog
          </Link>
        </div>

        <BookImportPanel categories={categories} />
      </div>
    </div>
  );
}
