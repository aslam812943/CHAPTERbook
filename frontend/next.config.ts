import type { NextConfig } from "next";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    // 75 is next/image's own default (used by every <Image> that doesn't
    // pass a quality prop); 100 is used explicitly by CtaSection.tsx and
    // CanvasSequence.tsx's static hero fallback.
    qualities: [75, 100],
    // The two automated book-import sources (see GoogleBooksProvider.ts /
    // OpenLibraryProvider.ts on the backend) - covers most book/author/
    // category images. Manually-pasted admin URLs can be any host, so those
    // stay unoptimized (see isOptimizableImageUrl.ts) rather than widening
    // this to a wildcard, which would turn the optimizer into an open
    // image proxy for whatever URL an admin pastes in.
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
