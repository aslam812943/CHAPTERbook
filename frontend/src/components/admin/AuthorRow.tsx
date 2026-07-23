"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateAuthorAction, deleteAuthorAction } from "@/app/admin/authors/actions";
import { Author } from "@/types/author";

export default function AuthorRow({ author }: { author: Author }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(author.name);
  const [imageUrl, setImageUrl] = useState(author.imageUrl ?? "");
  const [error, setError] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();

  function startEditing() {
    setName(author.name);
    setImageUrl(author.imageUrl ?? "");
    setError("");
    setIsEditing(true);
  }

  function handleSave() {
    startSave(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("imageUrl", imageUrl);
      const result = await updateAuthorAction(author.id, { success: false, message: "" }, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this author?")) return;
    startDelete(async () => {
      await deleteAuthorAction(author.id);
      router.refresh();
    });
  }

  if (isEditing) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Author name"
            className="flex-1 bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="flex-1 bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="text-xs font-medium px-3 py-1.5 bg-accent text-[#111] rounded hover:brightness-110 transition-all disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setError("");
            }}
            disabled={isSaving}
            className="text-xs font-medium px-3 py-1.5 bg-[#111] hover:bg-[#222] text-gray-300 rounded border border-gray-700 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-wrap justify-between gap-3 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#111] border border-gray-800 flex-shrink-0">
          {author.imageUrl && (
            <Image src={author.imageUrl} alt={author.name} fill className="object-cover" unoptimized />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#F4F3EE] truncate">{author.name}</p>
          <p className="text-xs text-gray-500 truncate">{author.slug}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={startEditing}
          className="text-xs font-medium px-3 py-1.5 bg-[#111] hover:bg-[#222] text-gray-300 rounded border border-gray-700 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs font-medium px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-100 rounded border border-red-800 transition-colors disabled:opacity-60"
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
