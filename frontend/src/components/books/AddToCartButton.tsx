"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { addToCartAction, buyNowAction, AddToCartFormState } from "@/app/books/[slug]/actions";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

const initialState: AddToCartFormState = { success: false, message: "" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex-1 bg-accent text-[#111] font-semibold py-3 px-6 rounded-md hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Adding..." : disabled ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}

export default function AddToCartButton({ bookId, stock, isLoggedIn }: { bookId: string; stock: number; isLoggedIn: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [state, formAction] = useActionState(addToCartAction, initialState);
  const { toast, showToast } = useToast();
  const [isBuyingNow, startBuyNow] = useTransition();
  const [buyNowError, setBuyNowError] = useState("");

  const handleAction = (payload: FormData) => {
    if (!isLoggedIn) {
      showToast("Please login to add to cart", false);
      return;
    }
    formAction(payload);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      showToast("Please login to buy now", false);
      return;
    }
    setBuyNowError("");
    startBuyNow(async () => {
      const result = await buyNowAction(bookId, quantity);
      if (!result.success) {
        setBuyNowError(result.message);
      }
    });
  };

  return (
    <>
      <form action={handleAction} className="space-y-4">
      <input type="hidden" name="bookId" value={bookId} />

      {stock > 0 && (
        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm text-gray-600">
            Quantity
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-ink hover:text-accent transition-colors"
            >
              -
            </button>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(stock, Math.max(1, Number(e.target.value) || 1)))}
              className="w-14 text-center bg-transparent text-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="px-3 py-1.5 text-ink hover:text-accent transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-500">{stock} in stock</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <SubmitButton disabled={stock === 0} />
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={stock === 0 || isBuyingNow}
          className="flex-1 bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuyingNow ? "Processing..." : "Buy Now"}
        </button>
      </div>

      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
      )}
      {buyNowError && <p className="text-sm text-red-600">{buyNowError}</p>}
    </form>

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </>
  );
}
