"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToWishlistAction, removeFromWishlistAction } from "@/app/wishlist/actions";

interface WishlistButtonProps {
  bookId: string;
  wishlisted: boolean;
  isLoggedIn?: boolean;
}

export default function WishlistButton({ bookId, wishlisted, isLoggedIn = false }: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [toast, setToast] = useState({ message: "", visible: false });

  function toggle() {
    if (!isLoggedIn) {
      setToast({ message: "Please login to save books to your wishlist", visible: true });
      setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
      return;
    }
    startTransition(async () => {
      if (wishlisted) {
        await removeFromWishlistAction(bookId);
      } else {
        await addToWishlistAction(bookId);
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

      {/* Local Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-[#1a1a1a] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm whitespace-nowrap">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          {toast.message}
        </div>
      </div>
    </>
  );
}
