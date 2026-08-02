import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { CartView } from "@/types/cart";
import { SafeUser } from "@/types/user";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

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

  return (
    <div className="min-h-screen bg-paper text-ink py-24 px-4 sm:px-8">
      <CheckoutForm cart={cart} savedAddress={savedAddress} />
    </div>
  );
}
