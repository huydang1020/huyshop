import Checkout from "@/components/checkout";
import LoginRequiredPage from "@/components/login-required";
import userService from "@/services/user.service";
import voucherService from "@/services/voucher.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Thanh toán đơn hàng",
  description: "Thanh toán đơn hàng",
};

export default async function CheckoutPage() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return <LoginRequiredPage page_redirect="thanh-toan" />;
  }
  const [listUserVouchers, listUserAddress] = await Promise.all([
    voucherService.getListUserVoucher(accessToken, {
      state: "got",
      is_still_valid: "true",
    }),
    userService.getListUserAddress(accessToken),
  ]);
  return (
    <Checkout
      listUserVouchers={
        listUserVouchers.data || {
          user_vouchers: [],
          total: 0,
        }
      }
      listUserAddress={
        listUserAddress.data || {
          user_addresses: [],
          total: 0,
        }
      }
    />
  );
}
