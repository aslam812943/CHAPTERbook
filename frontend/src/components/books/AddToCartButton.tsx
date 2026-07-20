"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCartAction, AddToCartFormState } from "@/app/books/[id]/actions";

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
  const [toast, setToast] = useState({ message: "", visible: false });

  const handleAction = (payload: FormData) => {
    if (!isLoggedIn) {
      setToast({ message: "Please login to add to cart", visible: true });
      setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
      return;
    }
    formAction(payload);
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

      <div className="flex items-center gap-4">
        <SubmitButton disabled={stock === 0} />
      </div>

      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>

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
