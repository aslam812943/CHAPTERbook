// /shop does 4 parallel catalog fetches plus a review-summary fetch per
// book (see page.tsx) - a plain spinner would sit there a while on a cold
// Render backend, so this mirrors the eventual grid shape instead.
const SKELETON_CARDS = Array.from({ length: 12 });

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white pt-20 animate-pulse">
      <div className="w-full h-[260px] sm:h-[250px] md:h-[300px] bg-gray-100" />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="h-10 w-full max-w-xl bg-gray-100 rounded-lg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {SKELETON_CARDS.map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] w-full bg-gray-100 rounded-md" />
              <div className="h-4 w-3/4 bg-gray-100 rounded mt-3" />
              <div className="h-3 w-1/2 bg-gray-100 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
