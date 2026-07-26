import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { CartView } from "@/types/cart";
import { SafeUser } from "@/types/user";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  await requireUser();

  const [{ cart }, { user }] = await Promise.all([
    apiClient.get<{ cart: CartView }>("/cart", { auth: true }),
    apiClient.get<{ user: SafeUser }>("/auth/me", { auth: true }),
  ]);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const savedAddress = user.addresses[0];

  const totalSavings = cart.items.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-10">Checkout</h1>
          <CheckoutForm savedAddress={savedAddress} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div key={item.bookId} className="flex justify-between text-sm gap-3">
                <span className="text-gray-600">
                  {item.title} <span className="text-gray-400">x{item.quantity}</span>
                  {item.discountPercentage > 0 && (
                    <>
                      {" "}
                      <span className="line-through text-gray-400">₹{item.originalPrice.toFixed(2)}</span>{" "}
                      <span className="text-accent">-{item.discountPercentage}%</span>
                    </>
                  )}
                </span>
                <span className="text-gray-800 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-1.5">
            {totalSavings > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>You save</span>
                <span>₹{totalSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-accent">₹{cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
