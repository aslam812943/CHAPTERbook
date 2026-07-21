"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface BookRequestStatusState {
  success: boolean;
  message: string;
}

export async function updateBookRequestStatusAction(
  id: string,
  status: "fulfilled" | "rejected",
  bookId?: string
): Promise<BookRequestStatusState> {
  await requireAdmin();

  try {
    await withRefresh(() =>
      apiClient.patch(`/admin/book-requests/${id}/status`, { status, bookId }, { auth: true })
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update the request." };
  }

  revalidatePath("/admin/book-requests");
  return { success: true, message: "Updated." };
}
