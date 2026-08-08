"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";
import { Category } from "@/types/category";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";
import { useConfirm } from "@/components/ConfirmDialogProvider";

export default function CategoryRow({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [imageUrl, setImageUrl] = useState(category.imageUrl ?? "");
  const [error, setError] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();
  const confirm = useConfirm();

  function startEditing() {
    setName(category.name);
    setImageUrl(category.imageUrl ?? "");
    setError("");
    setIsEditing(true);
  }

  function handleSave() {
    startSave(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("imageUrl", imageUrl);
      const result = await updateCategoryAction(category.id, { success: false, message: "" }, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete this category?",
      message: `Delete "${category.name}"? This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    startDelete(async () => {
      await deleteCategoryAction(category.id);
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
            placeholder="Category name"
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
        <div className="relative w-10 h-10 rounded overflow-hidden bg-[#111] border border-gray-800 flex-shrink-0">
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized={!isOptimizableImageUrl(category.imageUrl)}
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#F4F3EE] truncate">{category.name}</p>
          <p className="text-xs text-gray-500 truncate">{category.slug}</p>
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
