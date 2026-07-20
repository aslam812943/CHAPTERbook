export default function PriceDisplay({
  price,
  discountPercentage,
  finalPrice,
  className = "",
}: {
  price: number;
  discountPercentage: number;
  finalPrice: number;
  className?: string;
}) {
  const hasDiscount = discountPercentage > 0;

  if (!hasDiscount) {
    return <span className={`font-semibold text-accent ${className}`}>₹{price.toFixed(2)}</span>;
  }

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-semibold text-accent">₹{finalPrice.toFixed(2)}</span>
      <span className="text-gray-500 line-through text-[0.85em]">₹{price.toFixed(2)}</span>
      <span className="text-[0.7em] font-semibold uppercase tracking-wide bg-sale/15 text-sale px-1.5 py-0.5 rounded">
        -{discountPercentage}%
      </span>
    </span>
  );
}
