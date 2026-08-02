import type { Metadata } from "next";

// Applies to every /admin/* route at once - none of them have anything a
// search engine should index (also disallowed in robots.ts, this is the
// per-page reinforcement of the same rule).
export const metadata: Metadata = {
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
