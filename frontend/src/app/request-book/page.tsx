import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { BookRequest, BookRequestStatus } from "@/types/bookRequest";
import RequestBookForm from "@/components/RequestBookForm";

// Requires login and shows the visitor's own personal request list - a
// crawler has no session, so there's nothing indexable here.
export const metadata: Metadata = {
  title: "Request a Book",
  robots: { index: false },
};

const STATUS_STYLES: Record<BookRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function RequestBookPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  await requireUser();
  const { title } = await searchParams;

  // Clears the header's notification badge - fulfilled requests seen here
  // won't count toward it on the next navigation.
  await apiClient.post("/book-requests/mine/seen", undefined, { auth: true });

  const { bookRequests } = await apiClient.get<{ bookRequests: BookRequest[] }>("/book-requests/mine", {
    auth: true,
  });

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif italic mb-2">Request a Book</h1>
        <p className="text-gray-600 text-sm mb-10">
          Can&apos;t find a title in our shop? Tell us what you&apos;re looking for and we&apos;ll consider adding it.
        </p>

        <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-xl mb-12">
          <RequestBookForm initialTitle={title ?? ""} />
        </div>

        <h2 className="text-2xl font-serif italic mb-4">Your Requests</h2>

        {bookRequests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            You haven&apos;t requested any books yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-ink">{req.bookTitle}</p>
                  {req.authorName && <p className="text-sm text-gray-500">by {req.authorName}</p>}
                  {req.note && <p className="text-sm text-gray-500 mt-1">{req.note}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[req.status]}`}
                  >
                    {req.status}
                  </span>
                  {req.status === "fulfilled" && req.bookId && (
                    <Link href={`/books/${req.bookId}`} className="text-xs text-accent hover:underline">
                      View Book &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
