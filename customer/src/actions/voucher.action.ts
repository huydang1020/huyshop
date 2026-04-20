"use server";

import voucherService from "@/services/voucher.service";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function buyVoucherAction(voucher_id: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await voucherService.buyVoucher(accessToken, voucher_id);
  if (resp.code === 0) {
    revalidateTag("voucher-detail");
    revalidateTag("voucher-list");
    revalidateTag("user-voucher-list");
    revalidateTag("user-info");
  }
  return resp;
}

export async function getListUserVoucherAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await voucherService.getListUserVoucher(accessToken);
  return resp;
}

export async function verifyCodeAction(data: IVerifyCodeRequest) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await voucherService.verifyCode(accessToken, data);
  return resp;
}
