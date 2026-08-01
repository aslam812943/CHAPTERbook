"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface OfferFormState {
  success: boolean;
  message: string;
}

export async function createOfferAction(
  _prevState: OfferFormState,
  formData: FormData
): Promise<OfferFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const scopeType = String(formData.get("scopeType") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || undefined;
  const bookId = String(formData.get("bookId") ?? "") || undefined;
  const discountPercentage = Number(formData.get("discountPercentage") ?? 0);
  const isActive = formData.get("isActive") === "on";

  try {
    await withRefresh(() =>
      apiClient.post(
        "/offers",
        { name, scopeType, categoryId, bookId, discountPercentage, isActive },
        { auth: true }
      )
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to create offer." };
  }

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
  return { success: true, message: "Offer created." };
}

export async function updateOfferAction(
  id: string,
  _prevState: OfferFormState,
  formData: FormData
): Promise<OfferFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "") || undefined;
  const scopeType = String(formData.get("scopeType") ?? "") || undefined;
  const categoryId = String(formData.get("categoryId") ?? "") || undefined;
  const bookId = String(formData.get("bookId") ?? "") || undefined;
  const discountPercentageRaw = formData.get("discountPercentage");
  const discountPercentage = discountPercentageRaw ? Number(discountPercentageRaw) : undefined;
  const isActive = formData.has("isActive") ? formData.get("isActive") === "on" : undefined;

  try {
    await withRefresh(() =>
      apiClient.patch(
        `/offers/${id}`,
        { name, scopeType, categoryId, bookId, discountPercentage, isActive },
        { auth: true }
      )
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update offer." };
  }

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
  return { success: true, message: "Offer updated." };
}

export async function toggleOfferActiveAction(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await withRefresh(() => apiClient.patch(`/offers/${id}`, { isActive }, { auth: true }));
  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
}

export async function deleteOfferAction(id: string): Promise<void> {
  await requireAdmin();
  await withRefresh(() => apiClient.delete(`/offers/${id}`, { auth: true }));
  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
}
