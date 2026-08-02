"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";
import { BookLookupResult, Book } from "@/types/book";

export async function searchBooksAction(query: string): Promise<BookLookupResult[]> {
  await requireAdmin();

  if (query.trim().length < 2) return [];

  const { results } = await withRefresh(() =>
    apiClient.get<{ results: BookLookupResult[] }>(
      `/admin/books/search?q=${encodeURIComponent(query)}`,
      { auth: true }
    )
  );

  return results;
}

export interface CreateBookFormState {
  success: boolean;
  message: string;
}

export async function createBookAction(
  _prevState: CreateBookFormState,
  formData: FormData
): Promise<CreateBookFormState> {
  await requireAdmin();

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
    source: String(formData.get("source") ?? "manual") as "google" | "openlibrary" | "manual",
    sourceId: String(formData.get("sourceId") ?? "") || undefined,
  };

  let book: Book;
  try {
    const response = await withRefresh(() =>
      apiClient.post<{ book: Book }>("/books", payload, { auth: true })
    );
    book = response.book;
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to save the book. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/books?created=${book.id}`);
}
