import { create } from "zustand";
import {
  ICreateOrderPlanRequest,
  IOrderPlanRequest,
  IOrderPlanResponse,
} from "#src/types/plan.js";
import { request } from "../utils";

const url = "order-plan";

const getListOrderPlan = (data: IOrderPlanRequest) => {
  return request
    .get<IApiResponse<IOrderPlanResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createOrderPlan = (data: ICreateOrderPlanRequest) => {
  return request
    .post<IApiResponse<any>>(url, {
      json: data,
    })
    .json();
};

const createOrderPlanVnpay = (order_code: string) => {
  return request
    .post<IApiResponse<any>>(`${url}/vnpay`, {
      json: { order_code },
    })
    .json();
};

export { getListOrderPlan, createOrderPlan, createOrderPlanVnpay };
