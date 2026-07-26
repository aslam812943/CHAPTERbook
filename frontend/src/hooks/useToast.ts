"use client";

import { useCallback, useRef, useState } from "react";

interface ToastState {
  message: string;
  visible: boolean;
  success: boolean;
}

const INITIAL_STATE: ToastState = { message: "", visible: false, success: true };

export function useToast() {
  const [toast, setToast] = useState<ToastState>(INITIAL_STATE);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, success = true) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, visible: true, success });
    timeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return { toast, showToast };
}
