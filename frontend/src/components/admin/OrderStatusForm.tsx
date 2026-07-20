"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateOrderStatusAction, OrderStatusFormState } from "@/app/admin/orders/actions";
import { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const initialState: OrderStatusFormState = { success: false, message: "" };

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors disabled:opacity-60"
    >
      {pending ? "..." : "Update"}
    </button>
  );
}

export default function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [state, formAction] = useActionState(updateOrderStatusAction, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="orderId" value={orderId} />
        <select
          name="status"
          defaultValue={status}
          className="bg-[#111] border border-gray-700 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <UpdateButton />
      </form>
      {state.message && (
        <span className={`text-xs ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</span>
      )}
    </div>
  );
}
