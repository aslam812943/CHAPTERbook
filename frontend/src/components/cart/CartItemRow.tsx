"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCartItemAction, removeCartItemAction, CartActionState } from "@/app/cart/actions";
import { CartItemView } from "@/types/cart";

const initialState: CartActionState = { success: false, message: "" };

export default function CartItemRow({ item }: { item: CartItemView }) {
  const [state, formAction] = useActionState(updateCartItemAction, initialState);
  const [isRemoving, startRemove] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startRemove(async () => {
      await removeCartItemAction(item.bookId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-4 sm:flex-1 sm:min-w-0">
        <div className="relative w-14 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {item.coverImageUrl && (
            <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" unoptimized />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{item.title}</p>
          <p className="text-sm text-gray-500">
            ₹{item.price.toFixed(2)} each
            {item.discountPercentage > 0 && (
              <>
                {" "}
                <span className="line-through text-gray-400">₹{item.originalPrice.toFixed(2)}</span>{" "}
                <span className="text-accent">-{item.discountPercentage}%</span>
              </>
            )}
          </p>
          {state.message && <p className="text-xs text-red-600 mt-1">{state.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="bookId" value={item.bookId} />
          <input
            type="number"
            name="quantity"
            min={1}
            max={item.stock}
            defaultValue={item.quantity}
            className="w-16 bg-white border border-gray-300 rounded-md py-1.5 px-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          <button
            type="submit"
            className="text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          >
            Update
          </button>
        </form>

        <div className="font-semibold text-accent sm:w-20 sm:text-right">
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>

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
