"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Script from "next/script";
import { googleLoginAction } from "@/app/login/actions";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        setError("");
        startTransition(async () => {
          const result = await googleLoginAction(response.credential);
          if (!result.success) setError(result.message);
        });
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [scriptLoaded]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="flex justify-center" />
      {isPending && <p className="text-xs text-gray-500 text-center mt-2">Signing in...</p>}
      {error && <p className="text-xs text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
