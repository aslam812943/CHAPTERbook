import Link from "next/link";
import { requireAdmin } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";
import { PaginatedResult } from "@/types/common";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-700 text-gray-200",
  confirmed: "bg-blue-900/60 text-blue-200",
  shipped: "bg-purple-900/60 text-purple-200",
  delivered: "bg-green-900/60 text-green-200",
  cancelled: "bg-red-900/60 text-red-200",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const { items: orders, total } = await apiClient.get<PaginatedResult<Order>>(
    "/admin/orders?limit=50",
    { auth: true }
  );

  return (
    <div className="min-h-screen bg-[#111] text-[#F4F3EE] py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic mb-2">Orders</h1>
            <p className="text-gray-400">{total} order{total === 1 ? "" : "s"} placed</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-accent transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-[#F4F3EE]">{order.orderRef}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center flex-wrap gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <OrderStatusForm orderId={order.id} status={order.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Items</p>
                    {order.items.map((item) => (
                      <p key={item.bookId} className="text-gray-300">
                        {item.title} x{item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                    <div className="mt-2 space-y-0.5">
                      <p className="text-gray-400 text-xs">Items Subtotal: ₹{order.itemsTotal.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">
                        Delivery: {order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : "Free"}
                        {order.deliveryDistanceKm >= 0 && ` (${order.deliveryDistanceKm} km)`}
                      </p>
                      <p className="text-accent font-semibold">Total: ₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Deliver to</p>
                    <p className="text-gray-300">{order.deliveryAddressSnapshot.fullName}</p>
                    <p className="text-gray-300">{order.deliveryAddressSnapshot.phone}</p>
                    <p className="text-gray-300">
                      {order.deliveryAddressSnapshot.addressLine}, {order.deliveryAddressSnapshot.city}
                      {order.deliveryAddressSnapshot.postalCode ? `, ${order.deliveryAddressSnapshot.postalCode}` : ""}
                    </p>
                    <p className="text-gray-300">{order.deliveryAddressSnapshot.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
