import ListOrder from "@/components/list-order";
import LoginRequiredPage from "@/components/login-required";
import orderService from "@/services/order.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Danh sách đơn hàng",
  description: "Danh sách đơn hàng",
};

export default async function CartPage() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return <LoginRequiredPage page_redirect="danh-sach-don-hang" />;
  }
  const [resp, respReviews] = await Promise.all([
    orderService.getListOrderOfCustomer(accessToken, {
      limit: 10,
      skip: 0,
    }),
    orderService.getListReviewsOfCustomer(accessToken, {
      limit: 10,
      skip: 0,
    }),
  ]);

  return (
    <ListOrder
      data={resp?.data || { orders: [], total: 0 }}
      reviews={respReviews?.data || { reviews: [], total: 0 }}
    />
  );
}
