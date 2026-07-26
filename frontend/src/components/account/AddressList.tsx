"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAddressAction, setDefaultAddressAction } from "@/app/account/actions";
import { Address } from "@/types/user";

export default function AddressList({ addresses }: { addresses: Address[] }) {
  const [isRemoving, startRemove] = useTransition();
  const [isSettingDefault, startSetDefault] = useTransition();
  const router = useRouter();

  function handleRemove(index: number) {
    startRemove(async () => {
      await removeAddressAction(index);
      router.refresh();
    });
  }

  function handleSetDefault(index: number) {
    startSetDefault(async () => {
      await setDefaultAddressAction(index);
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
          className="flex flex-wrap items-start justify-between gap-3 bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-700 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-ink">{address.fullName}</p>
              {address.isDefault && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p>{address.phone}</p>
            <p>
              {address.addressLine}, {address.city}
              {address.postalCode ? `, ${address.postalCode}` : ""}
            </p>
            <p>{address.country}</p>
          </div>
          <div className="flex items-center flex-wrap gap-2 flex-shrink-0">
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefault(index)}
                disabled={isSettingDefault}
                className="text-xs font-medium px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 transition-colors disabled:opacity-60"
              >
                Set as default
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={isRemoving}
              className="text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 transition-colors disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
