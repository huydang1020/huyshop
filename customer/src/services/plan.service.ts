import { apiClient } from "@/utils/request";

const listPlan = async (
  accessToken: string
): Promise<IResponseAPI<IPlanResponse>> => {
  const response = await apiClient.get<IResponseAPI<IPlanResponse>>({
    url: "/api/customer/plan",
    next: { revalidate: 30 },
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const createOrderPlan = async (
  accessToken: string,
  data: ICreateOrderPlan
): Promise<IResponseAPI<ICheckoutResponse>> => {
  const response = await apiClient.post<IResponseAPI<ICheckoutResponse>>({
    url: "/api/customer/order-plan",
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify(data),
  });
  return response;
};

const createOrderPlanVnpay = async (orderCode: string, accessToken: string) => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: "/api/customer/order-plan/vnpay",
    body: JSON.stringify({ order_code: orderCode }),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

export default { listPlan, createOrderPlan, createOrderPlanVnpay };
