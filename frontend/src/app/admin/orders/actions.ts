"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";

export interface OrderStatusFormState {
  success: boolean;
  message: string;
}

export async function updateOrderStatusAction(
  _prevState: OrderStatusFormState,
  formData: FormData
): Promise<OrderStatusFormState> {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");

  try {
    await withRefresh(() => apiClient.patch(`/admin/orders/${orderId}/status`, { status }, { auth: true }));
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to update order status." };
  }

  revalidatePath("/admin/orders");
  return { success: true, message: "Status updated." };
}
