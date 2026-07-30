"use server";

import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError, withRefresh } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface CreateOrderResult {
  success: boolean;
  message: string;
  order?: Order;
}

export async function createOrderAction(address: AddressInput, saveAddress: boolean): Promise<CreateOrderResult> {
  await requireUser();

  try {
    if (saveAddress) {
      await withRefresh(() => apiClient.post("/auth/me/addresses", address, { auth: true })).catch(() => {
        // best-effort - a failed address save shouldn't block the order itself
      });
    }

    const response = await withRefresh(() =>
      apiClient.post<{ order: Order }>("/orders", { address }, { auth: true })
    );
    return { success: true, message: "", order: response.order };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to place order. Please try again." };
  }
}

export interface CreatePaymentOrderState {
  success: boolean;
  message: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
}

export async function createPaymentOrderAction(orderId: string): Promise<CreatePaymentOrderState> {
  await requireUser();

  try {
    const result = await withRefresh(() =>
      apiClient.post<{ razorpayOrderId: string; amount: number; currency: string; keyId: string }>(
        `/payments/orders/${orderId}`,
        {},
        { auth: true }
      )
    );
    return { success: true, message: "", ...result };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Failed to start payment. Please try again." };
  }
}

export interface VerifyPaymentState {
  success: boolean;
  message: string;
}

export async function verifyPaymentAction(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<VerifyPaymentState> {
  await requireUser();

  try {
    await withRefresh(() =>
      apiClient.post(
        "/payments/verify",
        {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        },
        { auth: true }
      )
    );
    return { success: true, message: "Payment successful!" };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Payment verification failed. Please contact support." };
  }
}
