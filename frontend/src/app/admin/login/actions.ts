"use server";

import { redirect } from "next/navigation";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { setSessionCookies } from "@/lib/dal/session";
import { AuthResponse } from "@/types/user";

export interface AuthFormState {
  success: boolean;
  message: string;
}

export async function loginAdminAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let response: AuthResponse;
  try {
    response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  if (response.user.role !== "admin") {
    return { success: false, message: "Access Denied: Administrator privileges required." };
  }

  await setSessionCookies(response.tokens);
  redirect("/admin");
}
