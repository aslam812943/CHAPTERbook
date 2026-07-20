import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import EditBookForm from "@/components/admin/EditBookForm";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [{ book }, { categories }] = await Promise.all([
    apiClient.get<{ book: Book }>(`/books/${id}`),
    apiClient.get<{ categories: Category[] }>("/categories"),
  ]);

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-serif italic">Edit Book</h1>
          <Link href="/admin/books" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Back to catalog
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
          <EditBookForm book={book} categories={categories} />
        </div>
      </div>
    </div>
  );
}
