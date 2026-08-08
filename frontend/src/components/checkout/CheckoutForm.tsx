"use client";

import { useEffect, useState, useTransition } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  createOrderAction,
  createPaymentOrderAction,
  estimateDeliveryAction,
  verifyPaymentAction,
} from "@/app/checkout/actions";
import { Address } from "@/types/user";
import { CartView } from "@/types/cart";
import { PaymentMethod } from "@/types/order";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const DELIVERY_ESTIMATE_DEBOUNCE_MS = 800;

export default function CheckoutForm({ cart, savedAddress }: { cart: CartView; savedAddress?: Address }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isEstimating, startEstimate] = useTransition();
  // Separate from `isPending` on purpose: the transition's async work (create
  // order, create payment order) finishes the moment `razorpay.open()` is
  // called, since opening the modal isn't awaited - so `isPending` alone
  // flips back to false while the modal is still genuinely open. Without
  // this, a second click while that first modal is up creates a second
  // Razorpay order for the same underlying order, and if the customer then
  // pays on the now-stale first modal, the payment succeeds on Razorpay's
  // side but the order record no longer points at that payment.
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast, showToast } = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState(savedAddress?.fullName ?? "");
  const [phone, setPhone] = useState(savedAddress?.phone ?? "");
  const [addressLine, setAddressLine] = useState(savedAddress?.addressLine ?? "");
  const [city, setCity] = useState(savedAddress?.city ?? "");
  const [postalCode, setPostalCode] = useState(savedAddress?.postalCode ?? "");
  const [country, setCountry] = useState(savedAddress?.country ?? "");
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");

  const [estimate, setEstimate] = useState<{ distanceKm: number; deliveryFee: number } | null>(null);

  // Auto-recalculates whenever the address fields that matter for delivery
  // are all filled in, debounced so it fires once the user pauses typing
  // rather than on every keystroke (Nominatim's free tier is rate-limited).
  // Any stale estimate is cleared eagerly in each field's onChange instead
  // of here, so this effect only ever needs to fetch, never reset state.
  useEffect(() => {
    if (!addressLine.trim() || !city.trim() || !country.trim()) return;

    const timer = setTimeout(() => {
      startEstimate(async () => {
        const result = await estimateDeliveryAction({
          addressLine,
          city,
          postalCode: postalCode.trim() || undefined,
          country,
        });
        if (result.success && result.distanceKm !== undefined && result.deliveryFee !== undefined) {
          setEstimate({ distanceKm: result.distanceKm, deliveryFee: result.deliveryFee });
        }
      });
    }, DELIVERY_ESTIMATE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [addressLine, city, postalCode, country]);

  const itemsTotal = cart.total;
  const totalSavings = cart.items.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const deliveryFee = estimate?.deliveryFee ?? 0;
  const grandTotal = itemsTotal + deliveryFee;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const address = {
      fullName: fullName.trim(),
      phone: phone.replace(/[\s-]/g, ""),
      addressLine: addressLine.trim(),
      city: city.trim(),
      postalCode: postalCode.trim() || undefined,
      country: country.trim(),
    };

    if (!address.fullName || !address.phone || !address.addressLine || !address.city || !address.country) {
      showToast("Please fill in all required fields.", false);
      return;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      showToast("Phone number must be exactly 10 digits.", false);
      return;
    }

    // Only Razorpay needs its checkout script ready - COD never opens a
    // payment modal at all, so there's nothing to wait for.
    if (paymentMethod === "razorpay" && (!scriptReady || typeof window.Razorpay === "undefined")) {
      showToast("Payment is still loading, try again in a moment.", false);
      return;
    }

    if (isPaymentModalOpen) return;

    startTransition(async () => {
      const created = await createOrderAction(address, saveAddress, paymentMethod);
      if (!created.success || !created.order) {
        showToast(created.message || "Failed to place order. Please try again.", false);
        return;
      }
      const order = created.order;

      // COD is already fully placed the moment the order exists - no
      // payment step to start, straight to the confirmation page.
      if (paymentMethod === "cod") {
        router.push(`/checkout/confirmation/${order.id}`);
        return;
      }

      const payment = await createPaymentOrderAction(order.id);
      if (!payment.success || !payment.razorpayOrderId || !payment.keyId) {
        showToast(payment.message || "Could not start payment.", false);
        // Order already exists (unpaid) - send them to its own page so they
        // can retry payment there instead of losing track of the order.
        router.push(`/checkout/confirmation/${order.id}`);
        return;
      }

      const razorpay = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Chapter Book Store",
        description: `Order ${order.orderRef}`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        handler: (response: unknown) => {
          setIsPaymentModalOpen(false);
          const result = response as RazorpaySuccessResponse;
          startTransition(async () => {
            const verified = await verifyPaymentAction(
              result.razorpay_order_id,
              result.razorpay_payment_id,
              result.razorpay_signature
            );
            if (!verified.success) {
              showToast(verified.message, false);
            }
            router.push(`/checkout/confirmation/${order.id}`);
          });
        },
        modal: {
          ondismiss: () => {
            setIsPaymentModalOpen(false);
            showToast("Payment cancelled. You can complete payment anytime from your order.", false);
            router.push(`/checkout/confirmation/${order.id}`);
          },
        },
      });

      razorpay.on("payment.failed", () => {
        showToast("Payment failed. Please try again.", false);
      });

      setIsPaymentModalOpen(true);
      razorpay.open();
    });
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-10">Checkout</h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
              <input
                value={addressLine}
                onChange={(e) => {
                  setAddressLine(e.target.value);
                  setEstimate(null);
                }}
                placeholder="Street address, apartment, etc."
                className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setEstimate(null);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setEstimate(null);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setEstimate(null);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="accent-accent"
              />
              Save this address to my account
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 border rounded-md py-3 px-4 cursor-pointer transition-colors ${
                    paymentMethod === "razorpay" ? "border-accent ring-1 ring-accent/60" : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="accent-accent"
                  />
                  <span className="text-sm text-ink">Pay Online</span>
                </label>
                <label
                  className={`flex items-center gap-3 border rounded-md py-3 px-4 cursor-pointer transition-colors ${
                    paymentMethod === "cod" ? "border-accent ring-1 ring-accent/60" : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-accent"
                  />
                  <span className="text-sm text-ink">Cash on Delivery</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {paymentMethod === "cod"
                ? "Pay in cash when your order arrives. You can cancel a Cash on Delivery order anytime before it ships."
                : "Placing your order saves these details, then opens a secure payment screen to complete your purchase."}
            </p>

            <button
              type="submit"
              disabled={isPending || isPaymentModalOpen}
              className="w-full bg-accent text-[#111] font-semibold py-4 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
            >
              {isPending || isPaymentModalOpen
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : "Proceed to Payment"}
            </button>
          </form>
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span>
                {isEstimating
                  ? "Calculating..."
                  : estimate
                    ? deliveryFee > 0
                      ? `₹${deliveryFee.toFixed(2)}`
                      : "Free"
                    : "Enter address"}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-1.5">
              <span>Total</span>
              <span className="text-accent">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </>
  );
}
