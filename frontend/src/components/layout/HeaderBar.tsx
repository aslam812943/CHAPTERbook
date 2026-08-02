"use client";

import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/logout/actions";
import { markBookRequestsSeenAction } from "@/app/request-book/actions";
import type { SessionPayload } from "@/lib/dal/session";
import type { BookRequest } from "@/types/bookRequest";
import { useHeroVisibility } from "./HeroVisibilityContext";

function HeaderIconLink({
  href,
  count,
  label,
  className,
  onClick,
  children,
}: {
  href: string;
  count: number;
  label: string;
  className: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors ${className}`}
    >
      {children}
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-semibold text-ink flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function RequestBookNotification({
  session,
  unseenFulfilled,
  panelClasses,
  onRequireLogin,
}: {
  session: SessionPayload | null;
  unseenFulfilled: BookRequest[];
  panelClasses: string;
  onRequireLogin: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const count = unseenFulfilled.length;

  return (
    <span className="relative inline-flex items-center">
      <Link
        href="/request-book"
        className="hover:text-accent transition-colors"
        onClick={(e) => {
          if (!session) {
            e.preventDefault();
            onRequireLogin();
          }
        }}
      >
        Request a Book
      </Link>

      {session && count > 0 && (
        <button
          type="button"
          aria-label={`${count} fulfilled book request${count === 1 ? "" : "s"}`}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) {
              startTransition(() => {
                markBookRequestsSeenAction();
              });
            }
          }}
          className="ml-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-semibold text-ink flex items-center justify-center leading-none hover:brightness-110 transition-all"
        >
          {count > 99 ? "99+" : count}
        </button>
      )}

      {open && (
        <div
          className={`absolute top-full right-0 mt-2 w-64 rounded-xl border shadow-xl z-20 overflow-hidden text-sm normal-case ${panelClasses}`}
        >
          <div className="px-4 py-3 border-b border-current/10 font-semibold">Fulfilled Requests</div>
          <div className="max-h-64 overflow-y-auto">
            {unseenFulfilled.map((req) => (
              <div key={req.id} className="px-4 py-3 border-b border-current/10 last:border-b-0">
                <p className="font-medium">{req.bookTitle}</p>
                {req.bookId ? (
                  <Link href={`/books/${req.bookId}`} className="text-xs text-accent hover:underline">
                    View Book &rarr;
                  </Link>
                ) : (
                  <p className="text-xs opacity-60">Now available in our catalog</p>
                )}
              </div>
            ))}
          </div>
          <Link href="/request-book" className="block px-4 py-2 text-xs text-center text-accent hover:underline">
            See all requests &rarr;
          </Link>
        </div>
      )}
    </span>
  );
}

export default function HeaderBar({
  session,
  cartCount,
  wishlistCount,
  unseenFulfilled,
}: {
  session: SessionPayload | null;
  cartCount: number;
  wishlistCount: number;
  unseenFulfilled: BookRequest[];
}) {
  const pathname = usePathname();
  const isAdminSide = pathname?.startsWith("/admin");
  const { headerVisible, heroDark } = useHeroVisibility();
  const [menuOpen, setMenuOpen] = useState(false);

  // Only the homepage's hero animation is ever allowed to hide the header
  // (and only on desktop - see CanvasSequence). Every other page shows it
  // unconditionally, regardless of whatever the shared visibility state
  // happens to be at that moment (e.g. mid-navigation away from "/" before
  // its cleanup has had a chance to restore it) - this is a hard guarantee,
  // not just cooperative behavior from the hero component.
  const isHome = pathname === "/";
  const effectiveHeaderVisible = isHome ? headerVisible : true;
  // Only true while the header sits directly on top of the hero's last
  // frame on the homepage - see HeroVisibilityContext.
  const isHeroDark = isHome && heroDark;

  const [toast, setToast] = useState({ message: "", visible: false });

  // Always land on a closed menu after navigating (route change or logout).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const headerClasses = isAdminSide
    ? "bg-[#111]/60 border-white/10 backdrop-blur-lg border-b"
    : isHeroDark
      ? "bg-black/40 border-white/10 backdrop-blur-lg border-b"
      : "bg-white/10 border-white/25 backdrop-blur-lg border-b shadow-[0_4px_30px_rgba(0,0,0,0.06)]";

  const logoClasses = isAdminSide
    ? "text-[#F4F3EE]"
    : isHeroDark
      ? "text-white"
      : "text-ink drop-shadow-sm";

  const navClasses = isAdminSide
    ? "text-[#F4F3EE]/90"
    : isHeroDark
      ? "text-white/90"
      : "text-ink/90 drop-shadow-sm hover:text-accent transition-colors";

  const signUpClasses = isAdminSide
    ? "bg-[#F4F3EE] text-[#111] hover:bg-accent"
    : isHeroDark
      ? "bg-accent text-[#111] hover:brightness-110"
      : "bg-ink text-paper hover:bg-accent hover:text-ink";

  const panelClasses = isAdminSide
    ? "bg-[#111] border-white/10 text-[#F4F3EE]/90"
    : isHeroDark
      ? "bg-[#111] border-white/10 text-white/90"
      : "bg-white/90 backdrop-blur-md border-black/10 text-ink/90";

  const barClasses = isAdminSide ? "bg-[#F4F3EE]" : isHeroDark ? "bg-white" : "bg-ink";

  const links = (
    <>
      {!isAdminSide && (
        <>
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-accent transition-colors">
            All Books
          </Link>
          <RequestBookNotification
            key={pathname}
            session={session}
            unseenFulfilled={unseenFulfilled}
            panelClasses={panelClasses}
            onRequireLogin={() => {
              setToast({ message: "Please login to request a book", visible: true });
              setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
            }}
          />
        </>
      )}

      {session ? (
        <>
          {session.role === "admin" && !isAdminSide && (
            <Link href="/admin" className="hover:text-accent transition-colors">
              Admin
            </Link>
          )}
          {!isAdminSide && (
            <Link href="/account" className="hover:text-accent transition-colors">
              My Account
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" className="hover:text-accent transition-colors cursor-pointer">
              Logout
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-accent transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className={`px-4 py-1.5 rounded-full font-medium transition-colors text-center ${signUpClasses}`}
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-out ${headerClasses} ${
        effectiveHeaderVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
        <Link href="/" className={`flex items-center gap-2 whitespace-nowrap ${logoClasses}`}>
          <span className="text-xl sm:text-2xl" aria-hidden>
            📖
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base sm:text-xl font-serif italic tracking-tight">Chapter Book Store</span>
            <span className="text-[10px] sm:text-xs font-sans not-italic tracking-wide text-accent">
              Read More, Grow More
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Desktop nav - hidden below md, where it would overflow */}
          <nav className={`hidden md:flex items-center gap-6 text-sm mr-2 ${navClasses}`}>{links}</nav>

          {!isAdminSide && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <HeaderIconLink
                href="/wishlist"
                count={wishlistCount}
                label="Wishlist"
                className={navClasses}
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    setToast({ message: "Please login to save books to your wishlist", visible: true });
                    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                  />
                </svg>
              </HeaderIconLink>

              <HeaderIconLink
                href="/cart"
                count={cartCount}
                label="Cart"
                className={navClasses}
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                    setToast({ message: "Please login to view your cart", visible: true });
                    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-2.25 0h12l1.263 12.007a1.125 1.125 0 01-1.119 1.243H5.856a1.125 1.125 0 01-1.12-1.243L6 10.5z"
                  />
                </svg>
              </HeaderIconLink>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden relative w-8 h-8 flex-shrink-0 flex flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-300 ${barClasses} ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-300 ${barClasses} ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-300 ${barClasses} ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel - collapsed via max-height (not display:none) so
          the open/close transition can animate, but that alone leaves every
          link/button/form inside still tab-focusable and screen-reader-
          announced even while visually collapsed, duplicating the desktop
          nav's content for anyone not using a pointer. inert removes it from
          focus and the accessibility tree while collapsed, without breaking
          the height transition. */}
      <div
        className={`md:hidden overflow-hidden border-t transition-all duration-300 ease-out ${panelClasses} ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
        inert={!menuOpen}
      >
        <nav className="flex flex-col gap-1 px-4 sm:px-6 py-4 text-base">
          {links}
        </nav>
      </div>

      {/* Global Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-[#1a1a1a] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm whitespace-nowrap">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          {toast.message}
        </div>
      </div>
    </header>
  );
}
