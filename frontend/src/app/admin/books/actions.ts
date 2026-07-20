"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface StockFormState {
  success: boolean;
  message: string;
}

export async function updateStockAction(
  _prevState: StockFormState,
  formData: FormData
): Promise<StockFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock") ?? 0);

  try {
    await withRefresh(() => apiClient.patch(`/books/${id}/stock`, { stock }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update stock." };
  }

  revalidatePath("/admin/books");
  return { success: true, message: "Stock updated." };
}

export async function deleteBookAction(id: string): Promise<{ success: boolean; message?: string }> {
  await requireAdmin();

  try {
    await withRefresh(() => apiClient.delete(`/books/${id}`, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to delete book." };
  }

  revalidatePath("/admin/books");
  return { success: true };
}
