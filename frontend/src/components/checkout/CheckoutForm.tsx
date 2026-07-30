"use client";

import { useState, useTransition } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createOrderAction, createPaymentOrderAction, verifyPaymentAction } from "@/app/checkout/actions";
import { Address } from "@/types/user";
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

const REQUIRED_FIELDS: Array<{ name: string; label: string }> = [
  { name: "fullName", label: "Full Name" },
  { name: "phone", label: "Phone" },
  { name: "addressLine", label: "Delivery Address" },
  { name: "city", label: "City" },
  { name: "country", label: "Country" },
];

export default function CheckoutForm({ savedAddress }: { savedAddress?: Address }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast, showToast } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const address = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      addressLine: String(formData.get("addressLine") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim() || undefined,
      country: String(formData.get("country") ?? "").trim(),
    };

    const missing = REQUIRED_FIELDS.find(({ name }) => !formData.get(name)?.toString().trim());
    if (missing) {
      showToast(`${missing.label} is required.`, false);
      return;
    }

    if (!scriptReady || typeof window.Razorpay === "undefined") {
      showToast("Payment is still loading, try again in a moment.", false);
      return;
    }

    const saveAddress = formData.get("saveAddress") === "on";

    startTransition(async () => {
      const created = await createOrderAction(address, saveAddress);
      if (!created.success || !created.order) {
        showToast(created.message || "Failed to place order. Please try again.", false);
        return;
      }
      const order = created.order;

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
            showToast("Payment cancelled. You can complete payment anytime from your order.", false);
            router.push(`/checkout/confirmation/${order.id}`);
          },
        },
      });

      razorpay.on("payment.failed", () => {
        showToast("Payment failed. Please try again.", false);
      });

      razorpay.open();
    });
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              name="fullName"
              defaultValue={savedAddress?.fullName}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={savedAddress?.phone}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
          <input
            name="addressLine"
            defaultValue={savedAddress?.addressLine}
            placeholder="Street address, apartment, etc."
            className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              name="city"
              defaultValue={savedAddress?.city}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            <input
              name="postalCode"
              defaultValue={savedAddress?.postalCode}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              name="country"
              defaultValue={savedAddress?.country}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="saveAddress" className="accent-accent" />
          Save this address to my account
        </label>

        <p className="text-xs text-gray-500">
          Placing your order saves these details, then opens a secure payment screen to complete your purchase.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-accent text-[#111] font-semibold py-4 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
        >
          {isPending ? "Processing..." : "Proceed to Payment"}
        </button>
      </form>

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </>
  );
}
