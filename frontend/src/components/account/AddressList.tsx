"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAddressAction } from "@/app/account/actions";
import { Address } from "@/types/user";

export default function AddressList({ addresses }: { addresses: Address[] }) {
  const [isRemoving, startRemove] = useTransition();
  const router = useRouter();

  function handleRemove(index: number) {
    startRemove(async () => {
      await removeAddressAction(index);
      router.refresh();
    });
  }

  if (addresses.length === 0) {
    return <p className="text-gray-500 text-sm">No saved addresses yet. They&apos;ll appear here after checkout.</p>;
  }

  return (
    <div className="space-y-3">
      {addresses.map((address, index) => (
        <div
          key={index}
          className="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-700">
            <p className="font-medium text-ink">{address.fullName}</p>
            <p>{address.phone}</p>
            <p>
              {address.addressLine}, {address.city}
              {address.postalCode ? `, ${address.postalCode}` : ""}
            </p>
            <p>{address.country}</p>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={isRemoving}
            className="text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 transition-colors disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
