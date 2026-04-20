"use server";

import cartService from "@/services/cart.service";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function upsertCartAction(data: ICartItem[]) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.upsertCart(data, accessToken);
    if (resp && resp.code === 0) {
      revalidateTag("cart");
      revalidateTag("user-info");
    }
    return resp;
  }
  return null;
}

export async function getCartAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.getCart(accessToken);
    return resp;
  }
  return null;
}

export async function deleteItemCartAction(productId: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.deleteItemCart(productId, accessToken);
    if (resp && resp.code === 0) {
      revalidateTag("cart");
      revalidateTag("user-info");
    }
    return resp;
  }
  return null;
}

export async function deleteAllCartAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.deleteAllCart(accessToken);
    if (resp && resp.code === 0) {
      revalidateTag("cart");
      revalidateTag("user-info");
    }
    return resp;
  }
  return null;
}

export async function checkoutCartAction(data: ICheckoutRequest) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.checkoutCart(data, accessToken);
    if (resp && resp.code === 0) {
      revalidateTag("cart");
      revalidateTag("user-info");
      revalidateTag("user-voucher-list");
    }
    return resp;
  }
  return null;
}

export async function createOrderVnpayAction(orderCode: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await cartService.createOrderVnpay(orderCode, accessToken);
    return resp;
  }
  return null;
}
