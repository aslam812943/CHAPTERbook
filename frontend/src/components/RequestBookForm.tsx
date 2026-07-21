"use client";

import { useState, useTransition } from "react";
import { requestBookAction } from "@/app/request-book/actions";

export default function RequestBookForm({ initialTitle = "" }: { initialTitle?: string }) {
  const [bookTitle, setBookTitle] = useState(initialTitle);
  const [authorName, setAuthorName] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await requestBookAction(bookTitle, authorName, note);
      setMessage({ text: result.message, success: result.success });
      if (result.success) {
        setBookTitle("");
        setAuthorName("");
        setNote("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-2">
          Book Title
        </label>
        <input
          type="text"
          id="bookTitle"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          required
          className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
          placeholder="e.g. The Name of the Wind"
        />
      </div>

      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
          Author <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
          placeholder="e.g. Patrick Rothfuss"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all resize-none"
          placeholder="Edition, language, or any other detail that helps us find it"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-70"
      >
        {isPending ? "Submitting..." : "Request This Book"}
      </button>

      {message && (
        <p className={`text-sm text-center ${message.success ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
