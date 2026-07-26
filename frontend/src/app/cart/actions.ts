"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface CartActionState {
  success: boolean;
  message: string;
}

export async function updateCartItemAction(bookId: string, quantity: number): Promise<CartActionState> {
  await requireUser();

  try {
    await withRefresh(() => apiClient.patch(`/cart/items/${bookId}`, { quantity }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update cart." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { success: true, message: "" };
}

export async function removeCartItemAction(bookId: string): Promise<CartActionState> {
  await requireUser();

  try {
    await withRefresh(() => apiClient.delete(`/cart/items/${bookId}`, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to remove item." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { success: true, message: "" };
}
