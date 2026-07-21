"use server";

import { redirect } from "next/navigation";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { setSessionCookies } from "@/lib/dal/session";
import { AuthResponse } from "@/types/user";

export interface AuthFormState {
  success: boolean;
  message: string;
}

export async function loginAction(
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

  await setSessionCookies(response.tokens);
  redirect(response.user.role === "admin" ? "/admin" : "/");
}

export interface GoogleAuthState {
  success: boolean;
  message: string;
}

export async function googleLoginAction(idToken: string): Promise<GoogleAuthState> {
  let response: AuthResponse;
  try {
    response = await apiClient.post<AuthResponse>("/auth/google", { idToken });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  await setSessionCookies(response.tokens);
  redirect(response.user.role === "admin" ? "/admin" : "/");
}
