// Mirrors the remotePatterns allowlist in next.config.ts - next/image throws
// a 400 for any external src not covered by remotePatterns, so any URL not
// matching one of these known hosts must render with unoptimized instead of
// crashing the image. Admin-pasted "manual" book/author/category URLs can be
// any host (real example in production: dcbookstore.com), so those stay
// unoptimized rather than widening next.config.ts to a wildcard.
const OPTIMIZABLE_HOSTS = new Set(["books.google.com", "covers.openlibrary.org"]);

export function isOptimizableImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}
