"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";

export interface CheckoutFormState {
  success: boolean;
  message: string;
}

export async function placeOrderAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  await requireUser();

  const address = {
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    addressLine: String(formData.get("addressLine") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? "") || undefined,
    country: String(formData.get("country") ?? ""),
  };

  const saveAddress = formData.get("saveAddress") === "on";

  let order: Order;
  try {
    if (saveAddress) {
      await withRefresh(() => apiClient.post("/auth/me/addresses", address, { auth: true })).catch(() => {
        // best-effort - a failed address save shouldn't block the order itself
      });
    }

    const response = await withRefresh(() =>
      apiClient.post<{ order: Order }>("/orders", { address }, { auth: true })
    );
    order = response.order;
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to place order. Please try again." };
  }

  redirect(`/checkout/confirmation/${order.id}`);
}
