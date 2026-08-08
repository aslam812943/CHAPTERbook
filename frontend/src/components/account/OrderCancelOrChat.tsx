"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderAction } from "@/app/checkout/actions";
import { Order } from "@/types/order";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/components/ConfirmDialogProvider";

// Same source/pattern as Footer.tsx's WhatsApp button.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

// Mirrors the backend's ALLOWED_STATUS_TRANSITIONS (orderStatus.ts) - only
// pending/confirmed orders can move to "cancelled". This is just for
// deciding whether to render the button at all; the backend is the real
// enforcement (see OrderService.cancelOrder), so a stale render here can
// only ever fail closed (show a button that then errors), never let
// through a cancellation that shouldn't happen.
const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

// Cash on Delivery orders can be self-cancelled (nothing was ever charged).
// Online-paid orders need a human for a refund, so this shows a WhatsApp
// link to the admin instead of a cancel button. Renders nothing once an
// order is past the point where either applies (shipped/delivered/already
// cancelled, or an unpaid online order still mid-checkout).
export default function OrderCancelOrChat({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const { toast, showToast } = useToast();
  const router = useRouter();
  const confirm = useConfirm();

  async function handleCancel() {
    const confirmed = await confirm({
      title: "Cancel order?",
      message: `Cancel order ${order.orderRef}? This can't be undone.`,
      confirmLabel: "Cancel order",
      cancelLabel: "Keep order",
      danger: true,
    });
    if (!confirmed) return;
    startTransition(async () => {
      const result = await cancelOrderAction(order.id);
      showToast(result.message, result.success);
      if (result.success) router.refresh();
    });
  }

  if (order.paymentMethod === "razorpay" && order.paymentStatus === "paid") {
    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hi, I'd like to cancel or request a refund for order ${order.orderRef}.`
    )}`;
    return (
      <>
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
          Need to cancel or get a refund? Chat with admin &rarr;
        </a>
        <Toast message={toast.message} visible={toast.visible} success={toast.success} />
      </>
    );
  }

  if (order.paymentMethod === "cod" && CANCELLABLE_STATUSES.has(order.status)) {
    return (
      <>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-60"
        >
          {isPending ? "Cancelling..." : "Cancel order"}
        </button>
        <Toast message={toast.message} visible={toast.visible} success={toast.success} />
      </>
    );
  }

  return null;
}
