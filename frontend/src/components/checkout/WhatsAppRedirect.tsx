"use client";

import { useEffect, useState } from "react";

export default function WhatsAppRedirect({ url }: { url: string }) {
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      const timer = setTimeout(() => setPopupBlocked(true), 0);
      return () => clearTimeout(timer);
    }
  }, [url]);

  return (
    <div className="mt-8 p-6 bg-white border border-accent/40 rounded-xl text-center">
      <p className="text-gray-700 mb-4">
        {popupBlocked
          ? "Your browser blocked the automatic redirect."
          : "Opening WhatsApp in a new tab..."}{" "}
        If nothing happened, tap the button below.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-accent text-[#111] font-semibold px-8 py-3 rounded-md hover:brightness-110 transition-all"
      >
        Open WhatsApp
      </a>
    </div>
  );
}
