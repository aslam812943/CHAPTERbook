"use server";

import { apiClient, ApiError } from "@/lib/dal/apiClient";

export interface ForgotPasswordState {
  success: boolean;
  message: string;
}

export async function requestResetCodeAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "");

  try {
    const res = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
    return { success: true, message: res.message };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export interface VerifyCodeState {
  success: boolean;
  message: string;
  resetToken?: string;
}

export async function verifyResetCodeAction(
  _prevState: VerifyCodeState,
  formData: FormData
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "");

  try {
    const res = await apiClient.post<{ resetToken: string }>("/auth/verify-reset-code", { email, code });
    return { success: true, message: "", resetToken: res.resetToken };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export interface ResetPasswordState {
  success: boolean;
  message: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const resetToken = String(formData.get("resetToken") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  try {
    await apiClient.post("/auth/reset-password", { resetToken, newPassword });
    return { success: true, message: "Password updated. You can now log in." };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
