"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createOfferAction, OfferFormState } from "@/app/admin/offers/actions";
import { Offer, OfferScopeType } from "@/types/offer";
import { Category } from "@/types/category";
import { Book } from "@/types/book";
import OfferRow from "./OfferRow";

const initialState: OfferFormState = { success: false, message: "" };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-[#111] font-semibold px-6 py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add Offer"}
    </button>
  );
}

export default function OfferManager({
  offers,
  categories,
  books,
}: {
  offers: Offer[];
  categories: Category[];
  books: Book[];
}) {
  const [state, formAction] = useActionState(createOfferAction, initialState);
  const [scopeType, setScopeType] = useState<OfferScopeType>("all");

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-3 bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Offer name, e.g. Monsoon Sale"
            className="bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          <input
            type="number"
            name="discountPercentage"
            required
            min={1}
            max={100}
            placeholder="Discount % (1-100)"
            className="bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            name="scopeType"
            value={scopeType}
            onChange={(e) => setScopeType(e.target.value as OfferScopeType)}
            className="bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            <option value="all">All Products</option>
            <option value="category">Category</option>
            <option value="product">Specific Product</option>
          </select>

          {scopeType === "category" && (
            <select
              name="categoryId"
              required
              className="bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {scopeType === "product" && (
            <select
              name="bookId"
              required
              className="bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              <option value="">Select book...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" name="isActive" defaultChecked className="accent-accent" />
          Active immediately
        </label>

        {state.message && (
          <p className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
        )}

        <AddButton />
      </form>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl divide-y divide-gray-800 overflow-hidden">
        {offers.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No offers yet.</p>
        ) : (
          offers.map((offer) => <OfferRow key={offer.id} offer={offer} categories={categories} books={books} />)
        )}
      </div>
    </div>
  );
}
