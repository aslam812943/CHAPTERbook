// Mirrors the eventual cover + details layout in page.tsx - this page does
// several sequential fetches (book, wishlist, reviews, related books), so a
// shaped skeleton reads better than a bare spinner while those resolve.
export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8 animate-pulse">
      <div className="max-w-5xl mx-auto">
        <div className="h-4 w-24 bg-gray-100 rounded" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
          <div className="aspect-[2/3] w-full max-w-sm bg-gray-100 rounded-lg" />

          <div className="flex flex-col gap-4">
            <div className="h-9 w-3/4 bg-gray-100 rounded" />
            <div className="h-5 w-1/2 bg-gray-100 rounded" />
            <div className="h-8 w-32 bg-gray-100 rounded mt-4" />
            <div className="h-11 w-40 bg-gray-100 rounded-full mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
