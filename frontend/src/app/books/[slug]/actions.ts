"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface AddToCartFormState {
  success: boolean;
  message: string;
}

export async function addToCartAction(
  _prevState: AddToCartFormState,
  formData: FormData
): Promise<AddToCartFormState> {
  await requireUser();

  const bookId = String(formData.get("bookId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);

  try {
    await withRefresh(() => apiClient.post("/cart/items", { bookId, quantity }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to add to cart. Please try again." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { success: true, message: "Added to cart." };
}

export async function buyNowAction(bookId: string, quantity: number): Promise<AddToCartFormState> {
  await requireUser();

  try {
    await withRefresh(() => apiClient.patch(`/cart/items/${bookId}`, { quantity }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to add to cart. Please try again." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/checkout");
}

export interface ReviewActionState {
  success: boolean;
  message: string;
}

export async function submitReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  await requireUser();

  const bookId = String(formData.get("bookId") ?? "");
  const bookSlug = String(formData.get("bookSlug") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");

  try {
    await withRefresh(() => apiClient.post("/reviews", { bookId, rating, title, body }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to submit review. Please try again." };
  }

  // Reviews are still submitted keyed by the real bookId (the API doesn't
  // know about slugs), but the page that needs revalidating lives at the
  // slug URL now, not the id.
  revalidatePath(`/books/${bookSlug}`);
  return { success: true, message: "Thanks! Your review has been submitted." };
}
