import Link from "next/link";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function OrderHistoryPage() {
  await requireUser();

  const { orders } = await apiClient.get<{ orders: Order[] }>("/orders/me", { auth: true });

  return (
    <div className="min-h-screen bg-paper text-ink py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">My Account</h1>
          <p className="text-gray-600">
            {orders.length} order{orders.length === 1 ? "" : "s"} placed
          </p>
        </div>

        <nav className="flex gap-6 border-b border-gray-200 mb-10 text-sm font-medium">
          <Link
            href="/account"
            className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-ink transition-colors"
          >
            Profile
          </Link>
          <Link href="/account/orders" className="pb-3 border-b-2 border-ink text-ink">
            Order History
          </Link>
        </nav>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/shop" className="text-accent hover:underline">
              Browse the shop
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
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
      </div>
    </div>
  );
}
