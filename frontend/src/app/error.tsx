"use client";

import { useEffect } from "react";
import Link from "next/link";

// Universal error boundary for every route that doesn't have its own
// error.tsx - catches render/data-fetching errors (e.g. the Render backend
// timing out - see apiClient.ts's AbortSignal.timeout) and shows a friendly
// fallback with a retry instead of the whole app crashing to a blank page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-24 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-serif italic text-ink mb-3">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t load this page. Please try again in a moment.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-full font-medium bg-ink text-paper hover:bg-accent hover:text-ink transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full font-medium border border-gray-300 text-ink hover:border-accent hover:text-accent transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
