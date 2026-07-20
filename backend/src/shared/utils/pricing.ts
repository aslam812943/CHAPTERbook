export function computeFinalPrice(price: number, discountPercentage: number): number {
  const final = price * (1 - discountPercentage / 100);
  return Math.round(final * 100) / 100;
}
