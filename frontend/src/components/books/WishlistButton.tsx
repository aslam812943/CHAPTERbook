"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToWishlistAction, removeFromWishlistAction } from "@/app/wishlist/actions";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

interface WishlistButtonProps {
  bookId: string;
  wishlisted: boolean;
  isLoggedIn?: boolean;
}

export default function WishlistButton({ bookId, wishlisted, isLoggedIn = false }: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast, showToast } = useToast();

  function toggle() {
    if (!isLoggedIn) {
      showToast("Please login to save books to your wishlist", false);
      return;
    }
    startTransition(async () => {
      if (wishlisted) {
        await removeFromWishlistAction(bookId);
        showToast("Removed from wishlist");
      } else {
        await addToWishlistAction(bookId);
        showToast("Added to wishlist");
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
      disabled={isPending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-md border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        wishlisted
          ? "bg-red-50 border-red-200 text-red-500"
          : "border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-200"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
        />
      </svg>
    </button>

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </>
  );
}
