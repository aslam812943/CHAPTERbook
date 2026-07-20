"use client";

import { useState } from "react";

export default function PricingFields({
  defaultPrice,
  defaultDiscountPercentage = 0,
  defaultStock = 1,
  priceHint,
}: {
  defaultPrice?: number;
  defaultDiscountPercentage?: number;
  defaultStock?: number;
  priceHint?: string;
}) {
  const [price, setPrice] = useState(defaultPrice ?? 0);
  const [discount, setDiscount] = useState(defaultDiscountPercentage);
  const final = Math.max(0, price * (1 - discount / 100));

  return (
    <div className="p-4 bg-[#111] border border-accent/30 rounded-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-accent mb-2">
            Price {priceHint && <span className="text-gray-500 font-normal">{priceHint}</span>}
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-accent mb-2">Discount %</label>
          <input
            type="number"
            name="discountPercentage"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-accent mb-2">Stock</label>
          <input
            type="number"
            name="stock"
            min={0}
            required
            defaultValue={defaultStock}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-sm">
        <span className="text-gray-400">
          {discount > 0 ? `Customer pays (${discount}% off)` : "Customer pays"}
        </span>
        <span className="text-lg font-semibold text-accent">
          ₹{final.toFixed(2)}
          {discount > 0 && <span className="ml-2 text-sm text-gray-500 line-through">₹{price.toFixed(2)}</span>}
        </span>
      </div>
    </div>
  );
}
