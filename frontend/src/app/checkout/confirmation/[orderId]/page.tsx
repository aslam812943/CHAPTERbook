import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient, ApiError } from "@/lib/dal/apiClient";
import { Order } from "@/types/order";
import WhatsAppRedirect from "@/components/checkout/WhatsAppRedirect";

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

  const whatsappNumber = process.env.WHATSAPP_NUMBER ?? "";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(order.whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-serif italic mb-3">Order Placed</h1>
        <p className="text-gray-600 mb-2">Reference: {order.orderRef}</p>
        <p className="text-gray-600">
          We&apos;ve saved your order. Send it to us on WhatsApp to confirm delivery and payment.
        </p>

        <WhatsAppRedirect url={waUrl} />

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
          <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold">
            <span>Total</span>
            <span className="text-accent">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Link href="/shop" className="inline-block mt-8 text-sm text-gray-500 hover:text-accent transition-colors">
          &larr; Continue shopping
        </Link>
      </div>
    </div>
  );
}
