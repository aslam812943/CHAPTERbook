import { getSession } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { CartView } from "@/types/cart";
import { WishlistView } from "@/types/wishlist";
import { BookRequest } from "@/types/bookRequest";
import HeaderBar from "./HeaderBar";

export default async function Header() {
  const session = await getSession();

  let cartCount = 0;
  let wishlistCount = 0;
  let unseenFulfilled: BookRequest[] = [];

  if (session) {
    const [{ cart }, { wishlist }, { bookRequests }] = await Promise.all([
      apiClient.get<{ cart: CartView }>("/cart", { auth: true }),
      apiClient.get<{ wishlist: WishlistView }>("/wishlist", { auth: true }),
      apiClient.get<{ bookRequests: BookRequest[] }>("/book-requests/unseen", { auth: true }),
    ]);
    cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    wishlistCount = wishlist.items.length;
    unseenFulfilled = bookRequests;
  }

  return (
    <HeaderBar
      session={session}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      unseenFulfilled={unseenFulfilled}
    />
  );
}
