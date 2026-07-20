"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface CategoryFormState {
  success: boolean;
  message: string;
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "") || undefined;
  const imageUrl = String(formData.get("imageUrl") ?? "") || undefined;

  try {
    await withRefresh(() => apiClient.post("/categories", { name, description, imageUrl }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to create category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true, message: "Category created." };
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "") || undefined;
  const description = String(formData.get("description") ?? "") || undefined;
  const imageUrl = String(formData.get("imageUrl") ?? "") || undefined;

  try {
    await withRefresh(() => apiClient.patch(`/categories/${id}`, { name, description, imageUrl }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true, message: "Category updated." };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  await withRefresh(() => apiClient.delete(`/categories/${id}`, { auth: true }));
  revalidatePath("/admin/categories");
}
