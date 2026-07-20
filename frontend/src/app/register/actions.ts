"use server";

import { redirect } from "next/navigation";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { setSessionCookies } from "@/lib/dal/session";
import { AuthResponse } from "@/types/user";
import { AuthFormState } from "@/app/login/actions";

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let response: AuthResponse;
  try {
    response = await apiClient.post<AuthResponse>("/auth/register", { name, email, password });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message };
    }
    return { success: false, message: "Something went wrong. Please try again." };
  }

  await setSessionCookies(response.tokens);
  redirect("/");
}
