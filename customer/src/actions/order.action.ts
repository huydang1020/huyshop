"use server";

import orderService from "@/services/order.service";
import { cookies } from "next/headers";

export async function getListOrderOfCustomerAction(query?: IOrderRequest) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await orderService.getListOrderOfCustomer(accessToken, query);
    return resp;
  }
  return null;
}

export async function cancelOrderAction(
  orderId: string,
  data: {
    cancel_reason: string;
  }
) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await orderService.cancelOrder(accessToken, orderId, data);
    return resp;
  }
  return null;
}

export async function rateProductAction(data: {
  order_id: string;
  product_id: string;
  rating: number;
  content: string;
  images?: string[];
}) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await orderService.rateProduct(accessToken, data);
    return resp;
  }
  return null;
}

export async function getListReviewsOfCustomerAction(query?: IReviewRequest) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await orderService.getListReviewsOfCustomer(
      accessToken,
      query
    );
    return resp;
  }
  return null;
}

export async function getListReviewsOfProductTypeAction(
  productTypeId: string,
  query?: IReviewRequest
) {
  const resp = await orderService.getListReviewsOfProductType(
    productTypeId,
    query
  );
  return resp;
}
