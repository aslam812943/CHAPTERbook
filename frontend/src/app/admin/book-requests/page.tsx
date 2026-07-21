import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { BookRequest } from "@/types/bookRequest";
import { Book, PaginatedResult } from "@/types/book";
import BookRequestStatusActions from "@/components/admin/BookRequestStatusActions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-700 text-gray-200",
  fulfilled: "bg-green-900/60 text-green-200",
  rejected: "bg-red-900/60 text-red-200",
};

export default async function AdminBookRequestsPage() {
  await requireAdmin();

  const [{ bookRequests }, { items: books }] = await Promise.all([
    apiClient.get<{ bookRequests: BookRequest[] }>("/admin/book-requests", { auth: true }),
    apiClient.get<PaginatedResult<Book>>("/books?limit=100"),
  ]);

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Book Requests</h1>
            <p className="text-gray-400">
              {bookRequests.length} title{bookRequests.length === 1 ? "" : "s"} readers have asked for
            </p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        {bookRequests.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            No book requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookRequests.map((req) => (
              <div key={req.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#F4F3EE]">{req.bookTitle}</p>
                    {req.authorName && <p className="text-sm text-gray-400">by {req.authorName}</p>}
                    {req.note && <p className="text-sm text-gray-400 mt-1">{req.note}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested by {req.requesterName} ({req.requesterEmail}) on{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[req.status]}`}
                    >
                      {req.status}
                    </span>
                    {req.status === "pending" && <BookRequestStatusActions id={req.id} books={books} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
