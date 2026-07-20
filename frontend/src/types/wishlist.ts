export interface WishlistItemView {
  bookId: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  coverImageUrl?: string;
  stock: number;
}

export interface WishlistView {
  items: WishlistItemView[];
}
