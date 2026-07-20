// Admin Login Page
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAdminAction, AuthFormState } from "./actions";

const initialState: AuthFormState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#F4F3EE] text-[#111] font-semibold py-3 px-4 rounded-md hover:bg-white transition-colors disabled:opacity-70"
    >
      {pending ? "Signing in..." : "Sign In to Admin"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-8 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-600 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700 rounded-full mix-blend-screen filter blur-3xl" />
      </div>
      
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl relative z-10">
        <h1 className="text-3xl font-serif italic text-[#F4F3EE] mb-2 text-center">Admin Login</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Sign in to manage the library.</p>

        {state.message && !state.success && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue="admin@gmail.com"
              required
              className="w-full bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              defaultValue="AdminPass123!"
              required
              className="w-full bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />
        </form>

        <p className="text-gray-500 text-sm text-center mt-8">
          Not an admin?{" "}
          <Link href="/login" className="text-[#F4F3EE] underline hover:text-accent">
            User Login
          </Link>
        </p>
      </div>
    </div>
  );
}
