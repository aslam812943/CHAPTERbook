"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateBookAction, EditBookFormState } from "@/app/admin/books/[id]/edit/actions";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import PricingFields from "./PricingFields";

const initialState: EditBookFormState = { success: false, message: "" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-[#111] font-semibold py-3 px-4 rounded-md hover:brightness-110 transition-all disabled:opacity-70"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function EditBookForm({ book, categories }: { book: Book; categories: Category[] }) {
  const [state, formAction] = useActionState(updateBookAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={book.id} />

      {state.message && !state.success && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">{state.message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            name="title"
            defaultValue={book.title}
            required
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Authors (comma separated)</label>
          <input
            name="authors"
            defaultValue={book.authors.join(", ")}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Publisher</label>
          <input
            name="publisher"
            defaultValue={book.publisher ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Published Date</label>
          <input
            name="publishedDate"
            defaultValue={book.publishedDate ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
          <input
            name="language"
            list="language-options-edit"
            defaultValue={book.language}
            required
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          <datalist id="language-options-edit">
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">ISBN-10</label>
          <input
            name="isbn10"
            defaultValue={book.isbn10 ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">ISBN-13</label>
          <input
            name="isbn13"
            defaultValue={book.isbn13 ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Page Count</label>
          <input
            type="number"
            name="pageCount"
            min={0}
            defaultValue={book.pageCount ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL</label>
          <input
            name="coverImageUrl"
            defaultValue={book.coverImageUrl ?? ""}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          defaultValue={book.description}
          rows={4}
          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60 resize-none"
        />
      </div>

      <PricingFields
        defaultPrice={book.price}
        defaultDiscountPercentage={book.discountPercentage}
        defaultStock={book.stock}
      />

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm text-gray-300 bg-[#1a1a1a] border border-gray-700 rounded-full px-3 py-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={book.categoryIds.includes(category.id)}
                  className="accent-accent"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <SaveButton />
    </form>
  );
}
