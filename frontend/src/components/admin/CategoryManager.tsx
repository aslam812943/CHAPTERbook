"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCategoryAction, CategoryFormState } from "@/app/admin/categories/actions";
import { Category } from "@/types/category";
import CategoryRow from "./CategoryRow";

const initialState: CategoryFormState = { success: false, message: "" };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-[#111] font-semibold px-6 py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add Category"}
    </button>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createCategoryAction, initialState);

  return (
    <div className="space-y-8">
      <form action={formAction} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="Category name, e.g. Mystery"
          className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (optional)"
          className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
        <AddButton />
      </form>
      <p className="-mt-6 text-xs text-gray-500">
        No image? A cover from one of the category&apos;s books is used on the storefront instead.
      </p>

      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
      )}

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl divide-y divide-gray-800 overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No categories yet.</p>
        ) : (
          categories.map((category) => <CategoryRow key={category.id} category={category} />)
        )}
      </div>
    </div>
  );
}
