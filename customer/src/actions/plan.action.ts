"use server";

import planService from "@/services/plan.service";
import { cookies } from "next/headers";
export async function listPlanAction(accessToken: string) {
  if (accessToken) {
    const resp = await planService.listPlan(accessToken);
    if (resp.code === 0 && resp.data) {
      return resp;
    }
  }
  return null;
}

export async function createOrderPlanAction(data: ICreateOrderPlan) {
  console.log("🚀 ~ createOrderPlanAction ~ data:", data);
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await planService.createOrderPlan(accessToken, data);
  return resp;
}

export async function createOrderPlanVnpayAction(orderCode: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await planService.createOrderPlanVnpay(orderCode, accessToken);
  console.log("🚀 ~ createOrderPlanVnpayAction ~ resp:", resp);
  return resp;
}
