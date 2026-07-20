"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface EditBookFormState {
  success: boolean;
  message: string;
}

export async function updateBookAction(
  _prevState: EditBookFormState,
  formData: FormData
): Promise<EditBookFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const authors = String(formData.get("authors") ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const payload = {
    title: String(formData.get("title") ?? ""),
    authors,
    description: String(formData.get("description") ?? ""),
    isbn10: String(formData.get("isbn10") ?? "") || undefined,
    isbn13: String(formData.get("isbn13") ?? "") || undefined,
    publisher: String(formData.get("publisher") ?? "") || undefined,
    publishedDate: String(formData.get("publishedDate") ?? "") || undefined,
    pageCount: formData.get("pageCount") ? Number(formData.get("pageCount")) : undefined,
    coverImageUrl: String(formData.get("coverImageUrl") ?? "") || undefined,
    price: Number(formData.get("price") ?? 0),
    discountPercentage: Number(formData.get("discountPercentage") ?? 0),
    stock: Number(formData.get("stock") ?? 0),
    categoryIds: formData.getAll("categoryIds").map(String),
    language: String(formData.get("language") ?? "English"),
  };

  try {
    await withRefresh(() => apiClient.patch(`/books/${id}`, payload, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update the book. Please try again." };
  }

  redirect("/admin/books");
}
