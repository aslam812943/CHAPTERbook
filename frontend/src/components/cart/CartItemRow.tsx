"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCartItemAction, removeCartItemAction } from "@/app/cart/actions";
import { CartItemView } from "@/types/cart";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

export default function CartItemRow({ item }: { item: CartItemView }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [syncedQuantity, setSyncedQuantity] = useState(item.quantity);
  const [isUpdating, startUpdate] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const router = useRouter();
  const { toast, showToast } = useToast();

  if (item.quantity !== syncedQuantity) {
    setSyncedQuantity(item.quantity);
    setQuantity(item.quantity);
  }

  function commitQuantity(next: number) {
    const clamped = Math.min(item.stock, Math.max(1, next));
    setQuantity(clamped);
    if (clamped === item.quantity) return;

    startUpdate(async () => {
      const result = await updateCartItemAction(item.bookId, clamped);
      if (result.success) {
        showToast("Cart updated.");
        router.refresh();
      } else {
        setQuantity(item.quantity);
        showToast(result.message, false);
      }
    });
  }

  function handleRemove() {
    startRemove(async () => {
      const result = await removeCartItemAction(item.bookId);
      if (result.success) {
        showToast(`${item.title} removed from cart.`);
        router.refresh();
      } else {
        showToast(result.message, false);
      }
    });
  }

  const isBusy = isUpdating || isRemoving;

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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => commitQuantity(quantity - 1)}
            disabled={isBusy || quantity <= 1}
            className="px-3 py-1.5 text-ink hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={item.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(item.stock, Math.max(1, Number(e.target.value) || 1)))}
            onBlur={(e) => commitQuantity(Number(e.target.value) || 1)}
            disabled={isBusy}
            className="w-12 text-center bg-transparent text-ink text-sm focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => commitQuantity(quantity + 1)}
            disabled={isBusy || quantity >= item.stock}
            className="px-3 py-1.5 text-ink hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <div className="font-semibold text-accent sm:w-20 sm:text-right">
          ₹{(item.price * quantity).toFixed(2)}
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isBusy}
          className="text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 transition-colors disabled:opacity-60"
        >
          {isRemoving ? "..." : "Remove"}
        </button>
      </div>

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </div>
  );
}
