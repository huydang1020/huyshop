import { createOrderVnpayAction } from "@/actions/cart.action";
import OrderStatus from "@/components/order-status";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trạng thái đơn hàng online",
  description: "Trạng thái đơn hàng online",
};

export default async function OrderStatusPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let responseCode = searchParams.vnp_ResponseCode as string;
  if (responseCode === "00") {
    const orderCode = searchParams.vnp_TxnRef as string;
    const resp = await createOrderVnpayAction(orderCode);
    if (resp && resp.code !== 0) {
      responseCode = "99";
    }
  }
  return <OrderStatus code={responseCode} />;
}
