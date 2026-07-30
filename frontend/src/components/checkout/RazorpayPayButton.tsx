"use client";

import Script from "next/script";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPaymentOrderAction, verifyPaymentAction } from "@/app/checkout/actions";
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

export default function RazorpayPayButton({
  orderId,
  orderRef,
  customerName,
  customerPhone,
}: {
  orderId: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [paid, setPaid] = useState(false);
  const { toast, showToast } = useToast();
  const router = useRouter();

  function handlePay() {
    if (!scriptReady || typeof window.Razorpay === "undefined") {
      showToast("Payment is still loading, try again in a moment.", false);
      return;
    }

    startTransition(async () => {
      const created = await createPaymentOrderAction(orderId);
      if (!created.success || !created.razorpayOrderId || !created.keyId) {
        showToast(created.message || "Could not start payment.", false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: created.keyId,
        amount: created.amount,
        currency: created.currency,
        name: "Chapter Book Store",
        description: `Order ${orderRef}`,
        order_id: created.razorpayOrderId,
        prefill: {
          name: customerName,
          contact: customerPhone,
        },
        handler: (response: unknown) => {
          const result = response as RazorpaySuccessResponse;
          startTransition(async () => {
            const verified = await verifyPaymentAction(
              result.razorpay_order_id,
              result.razorpay_payment_id,
              result.razorpay_signature
            );
            if (verified.success) {
              setPaid(true);
              showToast("Payment successful!");
              router.refresh();
            } else {
              showToast(verified.message, false);
            }
          });
        },
        modal: {
          ondismiss: () => {
            showToast("Payment cancelled.", false);
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

      {paid ? (
        <p className="text-sm font-semibold text-green-600">Payment received — thank you!</p>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={isPending}
          className="w-full bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:bg-accent hover:text-ink transition-colors disabled:opacity-60"
        >
          {isPending ? "Processing..." : "Pay Online Now"}
        </button>
      )}

      <Toast message={toast.message} visible={toast.visible} success={toast.success} />
    </>
  );
}
