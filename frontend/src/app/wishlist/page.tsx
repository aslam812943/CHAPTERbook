import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { WishlistView } from "@/types/wishlist";
import WishlistItemRow from "@/components/wishlist/WishlistItemRow";

export const metadata: Metadata = {
  title: "Your Wishlist",
  robots: { index: false },
};

export default async function WishlistPage() {
  await requireUser();

  const { wishlist } = await apiClient.get<{ wishlist: WishlistView }>("/wishlist", { auth: true });

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif italic mb-10">Your Wishlist</h1>

        {wishlist.items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            Your wishlist is empty.{" "}
            <Link href="/shop" className="text-accent hover:underline">
              Browse the shop
            </Link>
            .
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6">
            {wishlist.items.map((item) => (
              <WishlistItemRow key={item.bookId} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
