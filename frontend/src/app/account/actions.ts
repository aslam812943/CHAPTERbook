"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal/session";
import { apiClient, withRefresh } from "@/lib/dal/apiClient";

export async function removeAddressAction(index: number): Promise<void> {
  await requireUser();
  await withRefresh(() => apiClient.delete(`/auth/me/addresses/${index}`, { auth: true }));
  revalidatePath("/account");
}
