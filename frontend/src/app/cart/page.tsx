import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { CartView } from "@/types/cart";
import CartItemRow from "@/components/cart/CartItemRow";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

export default async function CartPage() {
  await requireUser();

  const { cart } = await apiClient.get<{ cart: CartView }>("/cart", { auth: true });

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif italic mb-10">Your Cart</h1>

        {cart.items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            Your cart is empty.{" "}
            <Link href="/shop" className="text-accent hover:underline">
              Browse the shop
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6">
              {cart.items.map((item) => (
                <CartItemRow key={item.bookId} item={item} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-lg text-gray-600">Total</span>
              <span className="text-3xl font-semibold text-accent">₹{cart.total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-8 block text-center bg-ink text-paper font-semibold py-4 rounded-md hover:bg-accent hover:text-ink transition-colors"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
