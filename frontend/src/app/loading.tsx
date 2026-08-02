// Universal fallback for every route that doesn't have its own loading.tsx -
// wraps page content in a Suspense boundary automatically (a Next.js file
// convention), so navigation shows this instantly instead of the browser
// sitting on the previous page until the next one's data fetching finishes.
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-24 px-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-ink/15 border-t-accent animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
