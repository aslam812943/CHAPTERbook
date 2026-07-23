"use client";

import { useState, useTransition } from "react";
import { updateBookRequestStatusAction } from "@/app/admin/book-requests/actions";
import { Book } from "@/types/book";

export default function BookRequestStatusActions({ id, books }: { id: string; books: Book[] }) {
  const [selectedBookId, setSelectedBookId] = useState("");
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(status: "fulfilled" | "rejected") {
    setMessage(null);
    startTransition(async () => {
      const result = await updateBookRequestStatusAction(
        id,
        status,
        status === "fulfilled" && selectedBookId ? selectedBookId : undefined
      );
      if (!result.success) setMessage({ text: result.message, success: false });
    });
  }

  return (
    <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
      <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
        <select
          value={selectedBookId}
          onChange={(e) => setSelectedBookId(e.target.value)}
          className="bg-[#111] border border-gray-700 rounded-md py-1.5 px-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-accent/60 w-full sm:w-auto sm:max-w-[160px]"
        >
          <option value="">No specific book</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("fulfilled")}
          className="text-xs font-medium px-3 py-1.5 bg-green-900/40 hover:bg-green-900/60 text-green-200 rounded border border-green-800 transition-colors disabled:opacity-60"
        >
          Mark Fulfilled
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("rejected")}
          className="text-xs font-medium px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {message && <span className="text-xs text-red-400">{message.text}</span>}
    </div>
  );
}
