import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Category } from "@/types/category";
import BookImportPanel from "@/components/admin/BookImportPanel";

export default async function ImportBookPage() {
  await requireAdmin();

  const { categories } = await apiClient.get<{ categories: Category[] }>("/categories");

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Add a Book</h1>
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
