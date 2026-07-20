import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { logoutAction } from "@/app/logout/actions";

const NAV_LINKS = [
  { href: "/admin/books", label: "Books", description: "Search & import titles, edit price and stock." },
  { href: "/admin/orders", label: "Orders", description: "Review WhatsApp orders and update fulfillment status." },
  { href: "/admin/categories", label: "Categories", description: "Manage genres used across the storefront." },
  { href: "/admin/authors", label: "Authors", description: "Manage the author directory shown on the storefront." },
];

export default async function AdminPage() {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-24 px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-600 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700 rounded-full mix-blend-screen filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">Library Administration</h1>
            <p className="text-gray-400 text-lg">Signed in as {session.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-100 rounded border border-red-800 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-accent/60 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">
                {link.label}
              </h2>
              <p className="text-gray-400 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
