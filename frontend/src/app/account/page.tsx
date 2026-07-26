import Link from "next/link";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { SafeUser } from "@/types/user";
import AddressList from "@/components/account/AddressList";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export default async function AccountPage() {
  await requireUser();

  const { user } = await apiClient.get<{ user: SafeUser }>("/auth/me", { auth: true });

  return (
    <div className="min-h-screen bg-paper text-ink py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">My Account</h1>
          <p className="text-gray-600 break-words">
            {user.name} &middot; {user.email}
          </p>
        </div>

        <nav className="flex gap-6 border-b border-gray-200 mb-10 text-sm font-medium">
          <Link href="/account" className="pb-3 border-b-2 border-ink text-ink">
            Profile
          </Link>
          <Link
            href="/account/orders"
            className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-ink transition-colors"
          >
            Order History
          </Link>
        </nav>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 max-w-lg">
              <ChangePasswordForm />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
            <AddressList addresses={user.addresses} />
          </section>
        </div>
      </div>
    </div>
  );
}
