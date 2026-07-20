export interface CartItemView {
  bookId: string;
  quantity: number;
  title: string;
  /** Price actually charged per unit (post-discount). */
  price: number;
  originalPrice: number;
  discountPercentage: number;
  coverImageUrl?: string;
  stock: number;
}

export interface CartView {
  items: CartItemView[];
  total: number;
}
