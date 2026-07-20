import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { SafeUser } from "@/types/user";
import { Order } from "@/types/order";
import AddressList from "@/components/account/AddressList";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AccountPage() {
  await requireUser();

  const [{ user }, { orders }] = await Promise.all([
    apiClient.get<{ user: SafeUser }>("/auth/me", { auth: true }),
    apiClient.get<{ orders: Order[] }>("/orders/me", { auth: true }),
  ]);

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">My Account</h1>
          <p className="text-gray-600">
            {user.name} &middot; {user.email}
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
          <AddressList addresses={user.addresses} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven&apos;t placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{order.orderRef}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1 mb-2">
                    {order.items.map((item) => (
                      <p key={item.bookId} className="text-gray-700">
                        {item.title} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <p className="text-accent font-semibold">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
