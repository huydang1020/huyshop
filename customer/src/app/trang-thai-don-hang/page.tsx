import OrderStatus from "@/components/order-status";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trạng thái đơn hàng",
  description: "Trạng thái đơn hàng",
};

export default async function OrderStatusPage() {
  return <OrderStatus code={"00"} />;
}
