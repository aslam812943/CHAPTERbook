import type { Metadata } from "next";
import { Geist, EB_Garamond } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HeroVisibilityProvider } from "@/components/layout/HeroVisibilityContext";
import MotionProvider from "@/components/layout/MotionProvider";
import { ConfirmDialogProvider } from "@/components/ConfirmDialogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Playfair Display Bold (homepage section titles) is intentionally NOT
// declared here - it's only ever used on 4 homepage components, so each of
// those loads it directly (see LatestBooks.tsx etc). Declaring it in the
// root layout would preload and download it on every single page (admin,
// checkout, cart...) even though ~20 of the site's 24 routes never render
// it. next/font dedupes identical declarations at build time, so this
// doesn't cost anything extra on the homepage itself.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chapter Book Store | Curated Books, Delivered",
    // Lets any page set metadata.title = "Page Name" and get
    // "Page Name | Chapter Book Store" for free, instead of every page
    // sharing this exact same title (search results/browser tabs/shared
    // links couldn't tell pages apart before this).
    template: "%s | Chapter Book Store",
  },
  description: "A curated bookstore. Browse the collection, add to cart, and order in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <ConfirmDialogProvider>
            <HeroVisibilityProvider>
              <Header />
              {children}
              <Footer />
            </HeroVisibilityProvider>
          </ConfirmDialogProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
