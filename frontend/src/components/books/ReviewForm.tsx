"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { submitReviewAction, ReviewActionState } from "@/app/books/[id]/actions";
import StarIcon from "./StarIcon";

const initialState: ReviewActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-[#111] font-semibold py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit Review"}
    </button>
  );
}

interface ReviewFormProps {
  bookId: string;
  bookTitle: string;
  blockedReason: "login" | "duplicate" | null;
}

export default function ReviewForm({ bookId, bookTitle, blockedReason }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState("");
  const [state, formAction] = useActionState(submitReviewAction, initialState);
  const disabled = blockedReason !== null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (rating === 0) {
      e.preventDefault();
      setFormError("Please select a rating.");
    } else {
      setFormError("");
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2.5">
        <span className="w-1 h-5 bg-accent rounded-full" />
        Write a Review
      </h3>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="rating" value={rating} />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Product</label>
          <div className="bg-gray-50 border border-gray-200 rounded-md py-2.5 px-3 text-gray-600">{bookTitle}</div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            disabled={disabled}
            placeholder="Summarise your experience..."
            className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={disabled}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(star)}
                aria-label={`${star} star`}
                className="disabled:cursor-not-allowed"
              >
                <StarIcon filled={(hoverRating || rating) >= star} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="body"
            required
            disabled={disabled}
            rows={4}
            placeholder="Tell others what you thought about this book..."
            className="w-full border border-gray-300 rounded-md py-2.5 px-3 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {(formError || state.message) && (
          <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
            {formError || state.message}
          </p>
        )}

        {!disabled ? (
          <SubmitButton />
        ) : (
          <div>
            <button
              type="button"
              disabled
              className="w-full bg-gray-200 text-gray-400 font-semibold py-3 rounded-md cursor-not-allowed"
            >
              Submit Review
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {blockedReason === "login" ? (
                <>
                  <Link href="/login" className="text-accent hover:underline">
                    Login
                  </Link>{" "}
                  to submit a review.
                </>
              ) : (
                "You've already reviewed this book."
              )}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
