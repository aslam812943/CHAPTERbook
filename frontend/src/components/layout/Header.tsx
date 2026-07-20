import { getSession } from "@/lib/dal/session";
import { apiClient } from "@/lib/dal/apiClient";
import { CartView } from "@/types/cart";
import { WishlistView } from "@/types/wishlist";
import HeaderBar from "./HeaderBar";

export default async function Header() {
  const session = await getSession();

  let cartCount = 0;
  let wishlistCount = 0;

  if (session) {
    const [{ cart }, { wishlist }] = await Promise.all([
      apiClient.get<{ cart: CartView }>("/cart", { auth: true }),
      apiClient.get<{ wishlist: WishlistView }>("/wishlist", { auth: true }),
    ]);
    cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    wishlistCount = wishlist.items.length;
  }

  return <HeaderBar session={session} cartCount={cartCount} wishlistCount={wishlistCount} />;
}
