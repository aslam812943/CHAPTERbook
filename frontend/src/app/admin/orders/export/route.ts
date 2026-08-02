import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dal/session";
import { getAccessToken } from "@/lib/dal/session";

const BASE_URL = process.env.EXPRESS_API_URL ?? "http://localhost:5000/api";

// A plain Route Handler, not a Server Action - this needs to stream a raw
// CSV file back to the browser as a download, which the JSON-only
// apiClient helper isn't built for. The browser can link straight to this
// URL (unlike the real backend endpoint) because it runs server-side and
// has access to the httpOnly access-token cookie, matching the same
// BFF/DAL pattern used everywhere else in this app.
export async function GET() {
  await requireAdmin();
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/admin/orders/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to export orders" }, { status: res.status });
  }

  const csv = await res.text();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        res.headers.get("content-disposition") ?? 'attachment; filename="orders-export.csv"',
    },
  });
}
