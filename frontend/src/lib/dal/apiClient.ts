import "server-only";

import { getAccessToken, getRefreshToken, setSessionCookies } from "./session";

const BASE_URL = process.env.EXPRESS_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  // Seconds to let Next.js cache this GET (ISR-style). Omit to keep the
  // default "no-store" behavior - only opt in on public, non-personalized
  // reads (catalog data). Never pass this alongside auth: true.
  revalidate?: number;
}

// Render's free tier can take 30-60s to wake from a cold sleep. Without a
// cap, a sleeping backend hangs the request (and the page render) until the
// platform's own upstream timeout kills it with an opaque error. Callers
// that need a fallback UI should catch ApiError/DOMException("TimeoutError").
//
// Kept well under Vercel's default 10s function duration (Hobby plan) on
// purpose: if this matched or exceeded it, Vercel's own platform-level kill
// switch could fire at the same time as (or before) this abort, killing the
// function before app/error.tsx ever gets a chance to render its fallback -
// the user would see Vercel's raw generic crash page instead. This margin is
// what lets our own error boundary reliably win that race.
const REQUEST_TIMEOUT_MS = 7_000;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (options.auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ...(options.revalidate !== undefined
      ? { next: { revalidate: options.revalidate } }
      : { cache: "no-store" as const }),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(payload?.message ?? res.statusText, res.status, payload?.details);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, opts?: { auth?: boolean; revalidate?: number }) =>
    request<T>(path, { method: "GET", auth: opts?.auth, revalidate: opts?.revalidate }),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: "POST", body, auth: opts?.auth }),
  patch: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: "PATCH", body, auth: opts?.auth }),
  delete: <T>(path: string, opts?: { auth?: boolean }) => request<T>(path, { method: "DELETE", auth: opts?.auth }),
};

/**
 * Attempts a silent refresh using the refresh-token cookie and persists the
 * new tokens. Only callable from Server Actions/Route Handlers (it mutates
 * cookies via setSessionCookies). Returns false if there's no refresh token
 * or it's no longer valid - callers should redirect to /login in that case.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { tokens } = await apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>(
      "/auth/refresh",
      { refreshToken }
    );
    await setSessionCookies(tokens);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs an authenticated call and retries exactly once after a silent refresh
 * if the first attempt is rejected with 401. Use inside Server Actions for
 * calls where an expired-but-refreshable access token shouldn't force a
 * re-login.
 */
export async function withRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed) return fn();
    }
    throw err;
  }
}
