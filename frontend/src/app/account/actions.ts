"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export async function removeAddressAction(index: number): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.delete(`/auth/me/addresses/${index}`, { auth: true }));
  revalidatePath("/account");
}

export async function setDefaultAddressAction(index: number): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.patch(`/auth/me/addresses/${index}/default`, undefined, { auth: true }));
  revalidatePath("/account");
}

export interface ChangePasswordState {
  success: boolean;
  message: string;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordState> {
  await requireUser();

  try {
    await withRefresh(() =>
      apiClient.post("/auth/me/password", { currentPassword, newPassword }, { auth: true })
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Password updated." };
}
