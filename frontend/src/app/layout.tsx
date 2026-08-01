import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond, Playfair_Display } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HeroVisibilityProvider } from "@/components/layout/HeroVisibilityContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Bold, non-italic - used only for homepage section titles (Shop By
// Categories, Latest Additions, etc), not the site-wide font-serif italic
// used everywhere else (logo, page headings, admin panel).
const playfairDisplayBold = Playfair_Display({
  variable: "--font-playfair-bold",
  subsets: ["latin"],
  weight: "700",
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "Chapter Book Store | Curated Books, Delivered",
  description: "A curated bookstore. Browse the collection, add to cart, and order in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${playfairDisplayBold.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HeroVisibilityProvider>
          <Header />
          {children}
          <Footer />
        </HeroVisibilityProvider>
      </body>
    </html>
  );
}
