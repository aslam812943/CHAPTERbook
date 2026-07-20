"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction } from "./actions";
import { AuthFormState } from "@/app/login/actions";

const initialState: AuthFormState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-70"
    >
      {pending ? "Creating account..." : "Create Account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 sm:px-8 py-24">
      <div className="w-full max-w-md p-8 bg-white rounded-xl border border-gray-200 shadow-xl">
        <h1 className="text-3xl font-serif italic text-ink mb-2 text-center">Join the Library</h1>
        <p className="text-gray-600 text-sm text-center mb-8">Create an account to start your collection.</p>

        {state.message && !state.success && (
          <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm text-center">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
              placeholder="Jane Reader"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <SubmitButton />
        </form>

        <p className="text-gray-500 text-sm text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline hover:text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
