"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface RequestBookState {
  success: boolean;
  message: string;
}

export async function requestBookAction(
  bookTitle: string,
  authorName: string,
  note: string
): Promise<RequestBookState> {
  await requireUser();

  if (!bookTitle.trim()) {
    return { success: false, message: "Please enter a book title." };
  }

  try {
    await withRefresh(() =>
      apiClient.post(
        "/book-requests",
        { bookTitle, authorName: authorName || undefined, note: note || undefined },
        { auth: true }
      )
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/request-book");
  return { success: true, message: "Thanks! We've received your request and will review it soon." };
}

export async function markBookRequestsSeenAction(): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.post("/book-requests/mine/seen", undefined, { auth: true }));
  revalidatePath("/", "layout");
}
