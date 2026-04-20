import { createOrderPlanVnpayAction } from "@/actions/plan.action";
import OrderPlanStatus from "@/components/order-plan-status";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trạng thái đơn hàng",
  description: "Trạng thái đơn hàng",
};

export default async function OrderStatusPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let responseCode = searchParams.vnp_ResponseCode as string;
  if (responseCode === "00") {
    const orderCode = searchParams.vnp_TxnRef as string;
    const resp = await createOrderPlanVnpayAction(orderCode);
    console.log("🚀 ~ OrderStatusPage ~ resp:", resp);
    if (resp && resp.code !== 0) {
      responseCode = "99";
    }
  }
  return <OrderPlanStatus code={responseCode} />;
}
