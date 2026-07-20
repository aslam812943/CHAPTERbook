"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal/session";
import { apiClient, withRefresh } from "@/lib/dal/apiClient";

export async function addToWishlistAction(bookId: string): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.post("/wishlist/items", { bookId }, { auth: true }));
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
}

export async function removeFromWishlistAction(bookId: string): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.delete(`/wishlist/items/${bookId}`, { auth: true }));
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
}
