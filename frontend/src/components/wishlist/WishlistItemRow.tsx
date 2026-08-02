"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { removeFromWishlistAction } from "@/app/wishlist/actions";
import { addToCartAction } from "@/app/books/[id]/actions";
import { WishlistItemView } from "@/types/wishlist";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";

export default function WishlistItemRow({ item }: { item: WishlistItemView }) {
  const [isRemoving, startRemove] = useTransition();
  const [isAdding, startAdd] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startRemove(async () => {
      await removeFromWishlistAction(item.bookId);
      router.refresh();
    });
  }

  function handleAddToCart() {
    startAdd(async () => {
      const formData = new FormData();
      formData.set("bookId", item.bookId);
      formData.set("quantity", "1");
      await addToCartAction({ success: false, message: "" }, formData);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 border-b border-gray-200 last:border-0">
      <Link href={`/books/${item.bookId}`} className="flex items-center gap-4 sm:flex-1 sm:min-w-0">
        <div className="relative w-14 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {item.coverImageUrl && (
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="56px"
              unoptimized={!isOptimizableImageUrl(item.coverImageUrl)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{item.title}</p>
          <p className="text-sm text-gray-500">
            ₹{item.price.toFixed(2)}
            {item.discountPercentage > 0 && (
              <>
                {" "}
                <span className="line-through text-gray-400">₹{item.originalPrice.toFixed(2)}</span>{" "}
                <span className="text-accent">-{item.discountPercentage}%</span>
              </>
            )}
          </p>
          {item.stock === 0 && <p className="text-xs text-red-600 mt-1">Out of stock</p>}
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || item.stock === 0}
          className="text-xs font-medium px-3 py-1.5 bg-accent text-[#111] hover:brightness-110 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 transition-colors disabled:opacity-60"
        >
          {isRemoving ? "..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
