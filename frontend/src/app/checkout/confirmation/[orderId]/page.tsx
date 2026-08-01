import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";
import RazorpayPayButton from "@/components/checkout/RazorpayPayButton";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireUser();
  const { orderId } = await params;

  let order: Order;
  try {
    const response = await apiClient.get<{ order: Order }>(`/orders/${orderId}`, { auth: true });
    order = response.order;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-serif italic mb-3">
          {order.paymentStatus === "paid" ? "Payment Received" : "Order Placed"}
        </h1>
        <p className="text-gray-600 mb-2">Reference: {order.orderRef}</p>
        <p className="text-gray-600">
          {order.paymentStatus === "paid"
            ? "Thank you! We'll get your order ready for delivery."
            : "Complete your payment below to confirm your order."}
        </p>

        {order.paymentStatus !== "paid" && (
          <div className="mt-8 max-w-xs mx-auto">
            <RazorpayPayButton
              orderId={order.id}
              orderRef={order.orderRef}
              customerName={order.deliveryAddressSnapshot.fullName}
              customerPhone={order.deliveryAddressSnapshot.phone}
            />
          </div>
        )}

        <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6 text-left">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.bookId} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.title} x{item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items Subtotal</span>
              <span>₹{order.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : "Free"}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1.5">
              <span>Total</span>
              <span className="text-accent">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link href="/shop" className="inline-block mt-8 text-sm text-gray-500 hover:text-accent transition-colors">
          &larr; Continue shopping
        </Link>
      </div>
    </div>
  );
}
