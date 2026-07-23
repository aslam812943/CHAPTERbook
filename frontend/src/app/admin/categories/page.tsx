import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Category } from "@/types/category";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const { categories } = await apiClient.get<{ categories: Category[] }>("/categories");

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">Categories</h1>
            <p className="text-gray-400">Genres used to organize the storefront.</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
