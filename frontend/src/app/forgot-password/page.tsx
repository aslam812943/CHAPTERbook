"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestResetCodeAction, verifyResetCodeAction, resetPasswordAction } from "./actions";

type Step = "email" | "code" | "password" | "done";

function ErrorBox({ children }: { children: string }) {
  return (
    <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm text-center">{children}</div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      const result = await requestResetCodeAction({ success: false, message: "" }, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setStep("code");
    });
  }

  function handleResendCode() {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      await requestResetCodeAction({ success: false, message: "" }, formData);
    });
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", code);
      const result = await verifyResetCodeAction({ success: false, message: "" }, formData);
      if (!result.success || !result.resetToken) {
        setError(result.message);
        return;
      }
      setResetToken(result.resetToken);
      setStep("password");
    });
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("resetToken", resetToken);
      formData.set("newPassword", newPassword);
      formData.set("confirmPassword", confirmPassword);
      const result = await resetPasswordAction({ success: false, message: "" }, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setStep("done");
    });
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 sm:px-8 py-24">
      <div className="w-full max-w-md p-8 bg-white rounded-xl border border-gray-200 shadow-xl">
        {step === "email" && (
          <>
            <h1 className="text-3xl font-serif italic text-ink mb-2 text-center">Forgot Password</h1>
            <p className="text-gray-600 text-sm text-center mb-8">
              Enter your email and we&apos;ll send you a 6-digit code to reset your password.
            </p>

            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {error && <ErrorBox>{error}</ErrorBox>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-70"
              >
                {isPending ? "Sending..." : "Send Code"}
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <h1 className="text-3xl font-serif italic text-ink mb-2 text-center">Enter Code</h1>
            <p className="text-gray-600 text-sm text-center mb-8">
              We sent a 6-digit code to <strong className="text-ink">{email}</strong>. It expires in 15 minutes.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
                  placeholder="000000"
                />
              </div>

              {error && <ErrorBox>{error}</ErrorBox>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-70"
              >
                {isPending ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("email");
                }}
                className="text-gray-500 hover:text-accent transition-colors"
              >
                &larr; Use a different email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isPending}
                className="text-ink underline hover:text-accent transition-colors disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-3xl font-serif italic text-ink mb-2 text-center">New Password</h1>
            <p className="text-gray-600 text-sm text-center mb-8">Choose a new password for your account.</p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && <ErrorBox>{error}</ErrorBox>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-70"
              >
                {isPending ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <h1 className="text-3xl font-serif italic text-ink mb-2">All Set</h1>
            <p className="text-gray-600 text-sm mb-8">Your password has been updated. You can now log in.</p>
            <Link
              href="/login"
              className="inline-block w-full bg-ink text-paper font-semibold py-3 px-4 rounded-md hover:bg-accent hover:text-ink transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {step !== "done" && (
          <p className="text-gray-500 text-sm text-center mt-8">
            Remembered your password?{" "}
            <Link href="/login" className="text-ink underline hover:text-accent">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
