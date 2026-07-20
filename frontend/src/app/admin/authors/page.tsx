import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Author } from "@/types/author";
import AuthorManager from "@/components/admin/AuthorManager";

export default async function AdminAuthorsPage() {
  await requireAdmin();

  const { authors } = await apiClient.get<{ authors: Author[] }>("/authors");

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Authors</h1>
            <p className="text-gray-400">The author directory shown on the storefront.</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        <AuthorManager authors={authors} />
      </div>
    </div>
  );
}
