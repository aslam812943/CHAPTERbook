import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is next/image's own default (used by every <Image> that doesn't
    // pass a quality prop); 100 is used explicitly by CtaSection.tsx and
    // CanvasSequence.tsx's static hero fallback.
    qualities: [75, 100],
  },
};

export default nextConfig;
