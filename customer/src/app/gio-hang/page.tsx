import CartComponent from "@/components/cart";
import LoginRequiredPage from "@/components/login-required";
import cartService from "@/services/cart.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Giỏ hàng",
};

export default async function CartPage() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return <LoginRequiredPage page_redirect="gio-hang" />;
  }
  let cartItems: ICartResponse = { stores: [] };
  const resp = await cartService.getCart(accessToken);
  if (resp.code === 0) {
    cartItems = resp.data;
  }

  return <CartComponent cartItems={cartItems} />;
}
