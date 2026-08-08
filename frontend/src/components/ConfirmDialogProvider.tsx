"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Red confirm button - for destructive actions (delete/cancel), not
  // neutral ones.
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// Drop-in replacement for window.confirm(message) - same "await a boolean"
// shape, so call sites just swap `window.confirm(x)` for `await confirm(x)`,
// but rendered as a dialog that matches the site's own design instead of
// the browser's stock one.
const ConfirmContext = createContext<ConfirmFn>(async () => false);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve });
    });
  }, []);

  const settle = useCallback(
    (result: boolean) => {
      pending?.resolve(result);
      setPending(null);
    },
    [pending]
  );

  useEffect(() => {
    if (!pending) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pending, settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pending && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
          onClick={() => settle(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-message"
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {pending.title && <h2 className="text-lg font-semibold text-ink mb-2">{pending.title}</h2>}
            <p id="confirm-dialog-message" className="text-sm text-gray-600 mb-6">
              {pending.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => settle(false)}
                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-ink hover:border-accent hover:text-accent transition-colors"
              >
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                autoFocus
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pending.danger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-ink text-paper hover:bg-accent hover:text-ink"
                }`}
              >
                {pending.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}
