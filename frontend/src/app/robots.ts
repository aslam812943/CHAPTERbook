import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, authenticated-only, and transactional pages have nothing for
      // a search engine to usefully index, and account/cart/checkout pages
      // are personalized per-visitor anyway.
      disallow: ["/admin", "/account", "/cart", "/checkout", "/wishlist", "/forgot-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
