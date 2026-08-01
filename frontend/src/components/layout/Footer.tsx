"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { smoothScrollTo } from "@/lib/smoothScrollTo";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I have a question about a book."
)}`;

const SOCIAL_ICONS = [
  {
    name: "Facebook",
    href: "#",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z",
  },
  {
    name: "X",
    href: "#",
    path: "M18.9 3H22l-7.2 8.2L23 21h-6.6l-5.2-6.6L5.2 21H2l7.7-8.8L1.5 3h6.8l4.7 6.1Zm-1.2 16h1.7L7.4 4.9H5.6Z",
  },
  {
    name: "Instagram",
    href: "#",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm4.8-3.6a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z",
  },
  {
    name: "YouTube",
    href: "#",
    path: "M23 12s0-3.6-.5-5.3a3 3 0 0 0-2.1-2C18.7 4.2 12 4.2 12 4.2s-6.7 0-8.4.5a3 3 0 0 0-2.1 2C1 8.4 1 12 1 12s0 3.6.5 5.3a3 3 0 0 0 2.1 2c1.7.5 8.4.5 8.4.5s6.7 0 8.4-.5a3 3 0 0 0 2.1-2C23 15.6 23 12 23 12ZM9.8 15.5v-7l6 3.5Z",
  },
] as const;

export default function Footer() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <>
      <footer className="bg-ink text-paper/80">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="text-2xl font-serif italic text-paper tracking-tight">
              Chapter Book Store
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              A curated bookstore for readers who still love turning real pages. Browse the collection, add to
              your cart, and order in minutes.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/shop" className="hover:text-accent transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-accent transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-accent transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-accent transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-accent transition-colors">
                  Create Account
                </Link>
              </li>
              {/* Placeholder - no page built yet */}
              <li className="text-paper/40 cursor-default">FAQ</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                 +91 6282 642 007
                </a>
              </li>
              <li>
                <a href="mailto:chapterbookstoretvm@gmail.com" className="hover:text-accent transition-colors">
                  chapterbookstoretvm@gmail.com
                </a>
              </li>
            </ul>

            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mt-6 mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-accent hover:text-ink transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-accent hover:text-ink transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.2-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4L9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper/50">
            <p>&copy; {year} Chapter Book Store. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <span className="cursor-default">Privacy</span>
              <span className="cursor-default">Terms</span>
              <span className="cursor-default">Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating actions */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3">
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-accent text-ink shadow-lg hover:brightness-110 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.2-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4L9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" />
          </svg>
        </a>

        <button
          type="button"
          onClick={() => smoothScrollTo(0)}
          aria-label="Back to top"
          className={`w-12 h-12 flex items-center justify-center rounded-full bg-ink text-paper shadow-lg hover:bg-accent hover:text-ink transition-all duration-300 ${
            showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
          </svg>
        </button>
      </div>
    </>
  );
}
