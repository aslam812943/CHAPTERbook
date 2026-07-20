"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface AuthorFormState {
  success: boolean;
  message: string;
}

export async function createAuthorAction(
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "") || undefined;

  try {
    await withRefresh(() => apiClient.post("/authors", { name, imageUrl }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to create author." };
  }

  revalidatePath("/admin/authors");
  revalidatePath("/", "layout");
  return { success: true, message: "Author created." };
}

export async function updateAuthorAction(
  id: string,
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "") || undefined;
  const imageUrl = String(formData.get("imageUrl") ?? "") || undefined;

  try {
    await withRefresh(() => apiClient.patch(`/authors/${id}`, { name, imageUrl }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update author." };
  }

  revalidatePath("/admin/authors");
  revalidatePath("/", "layout");
  return { success: true, message: "Author updated." };
}

export async function deleteAuthorAction(id: string): Promise<void> {
  await requireAdmin();
  await withRefresh(() => apiClient.delete(`/authors/${id}`, { auth: true }));
  revalidatePath("/admin/authors");
  revalidatePath("/", "layout");
}
