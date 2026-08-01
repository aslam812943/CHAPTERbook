"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOfferAction, deleteOfferAction, toggleOfferActiveAction } from "@/app/admin/offers/actions";
import { Offer, OfferScopeType } from "@/types/offer";
import { Category } from "@/types/category";
import { Book } from "@/types/book";

export default function OfferRow({
  offer,
  categories,
  books,
}: {
  offer: Offer;
  categories: Category[];
  books: Book[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(offer.name);
  const [scopeType, setScopeType] = useState<OfferScopeType>(offer.scopeType);
  const [categoryId, setCategoryId] = useState(offer.categoryId ?? "");
  const [bookId, setBookId] = useState(offer.bookId ?? "");
  const [discountPercentage, setDiscountPercentage] = useState(String(offer.discountPercentage));
  const [error, setError] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const router = useRouter();

  function startEditing() {
    setName(offer.name);
    setScopeType(offer.scopeType);
    setCategoryId(offer.categoryId ?? "");
    setBookId(offer.bookId ?? "");
    setDiscountPercentage(String(offer.discountPercentage));
    setError("");
    setIsEditing(true);
  }

  function handleSave() {
    startSave(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("scopeType", scopeType);
      if (scopeType === "category") formData.set("categoryId", categoryId);
      if (scopeType === "product") formData.set("bookId", bookId);
      formData.set("discountPercentage", discountPercentage);
      const result = await updateOfferAction(offer.id, { success: false, message: "" }, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete the offer "${offer.name}"?`)) return;
    startDelete(async () => {
      await deleteOfferAction(offer.id);
      router.refresh();
    });
  }

  function handleToggleActive() {
    startToggle(async () => {
      await toggleOfferActiveAction(offer.id, !offer.isActive);
      router.refresh();
    });
  }

  const scopeLabel =
    offer.scopeType === "all"
      ? "All Products"
      : offer.scopeType === "category"
        ? `Category: ${categories.find((c) => c.id === offer.categoryId)?.name ?? "Unknown"}`
        : `Product: ${books.find((b) => b.id === offer.bookId)?.title ?? "Unknown"}`;

  if (isEditing) {
    return (
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Offer name"
            className="bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            placeholder="Discount %"
            className="bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={scopeType}
            onChange={(e) => setScopeType(e.target.value as OfferScopeType)}
            className="bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            <option value="all">All Products</option>
            <option value="category">Category</option>
            <option value="product">Specific Product</option>
          </select>
          {scopeType === "category" && (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
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
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
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
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              !name.trim() ||
              (scopeType === "category" && !categoryId) ||
              (scopeType === "product" && !bookId)
            }
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
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[#F4F3EE] truncate">{offer.name}</p>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              offer.isActive ? "bg-green-900/60 text-green-200" : "bg-gray-700 text-gray-300"
            }`}
          >
            {offer.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {scopeLabel} &middot; -{offer.discountPercentage}%
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={isToggling}
          className="text-xs font-medium px-3 py-1.5 bg-[#111] hover:bg-[#222] text-gray-300 rounded border border-gray-700 transition-colors disabled:opacity-60"
        >
          {isToggling ? "..." : offer.isActive ? "Deactivate" : "Activate"}
        </button>
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
