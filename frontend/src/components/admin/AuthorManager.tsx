"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAuthorAction, AuthorFormState } from "@/app/admin/authors/actions";
import { Author } from "@/types/author";
import AuthorRow from "./AuthorRow";

const initialState: AuthorFormState = { success: false, message: "" };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-[#111] font-semibold px-6 py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add Author"}
    </button>
  );
}

export default function AuthorManager({ authors }: { authors: Author[] }) {
  const [state, formAction] = useActionState(createAuthorAction, initialState);

  return (
    <div className="space-y-8">
      <form action={formAction} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="Author name, e.g. M T Vasudevan Nair"
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
        Authors are also created automatically (name only) whenever a book is saved with an author who isn&apos;t
        in this list yet - add a photo here whenever you get the chance.
      </p>

      {state.message && (
        <p className={`text-sm ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</p>
      )}

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl divide-y divide-gray-800 overflow-hidden">
        {authors.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No authors yet.</p>
        ) : (
          authors.map((author) => <AuthorRow key={author.id} author={author} />)
        )}
      </div>
    </div>
  );
}
