"use server";

import { redirect } from "next/navigation";
import { clearSessionCookies } from "@/lib/dal/session";

export async function logoutAction(): Promise<void> {
  await clearSessionCookies();
  redirect("/login");
}
