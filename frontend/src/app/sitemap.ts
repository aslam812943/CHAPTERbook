import type { MetadataRoute } from "next";
import { apiClient } from "@/lib/dal/apiClient";
import { Book, PaginatedResult } from "@/types/book";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Regenerated hourly rather than on every crawl request - the catalog
// doesn't change often enough to need per-request freshness here.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Falls back to just the static routes rather than failing the whole
  // sitemap if the Render backend is asleep/unreachable when this runs.
  let bookRoutes: MetadataRoute.Sitemap = [];
  try {
    const { items } = await apiClient.get<PaginatedResult<Book>>("/books?limit=100");
    bookRoutes = items.map((book) => ({
      url: `${SITE_URL}/books/${book.slug}`,
      lastModified: book.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // See comment above - swallow and return what we have.
  }

  return [...staticRoutes, ...bookRoutes];
}
