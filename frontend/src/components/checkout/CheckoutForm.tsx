"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrderAction, CheckoutFormState } from "@/app/checkout/actions";
import { Address } from "@/types/user";

const initialState: CheckoutFormState = { success: false, message: "" };

function PlaceOrderButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-[#111] font-semibold py-4 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Placing order..." : "Place Order via WhatsApp"}
    </button>
  );
}

export default function CheckoutForm({ savedAddress }: { savedAddress?: Address }) {
  const [state, formAction] = useActionState(placeOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message && !state.success && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{state.message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            name="fullName"
            required
            defaultValue={savedAddress?.fullName}
            className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={savedAddress?.phone}
            className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
        <input
          name="addressLine"
          required
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
            required
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
            required
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
        Placing your order sends these details, along with your cart, to us on WhatsApp so we can confirm delivery
        and payment with you directly.
      </p>

      <PlaceOrderButton />
    </form>
  );
}
