import { apiClient } from "@/utils/request";

const upsertCart = async (
  data: ICartItem[],
  accessToken: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: "/api/customer/cart",
    body: JSON.stringify(data),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const getCart = async (accessToken: string) => {
  const response = await apiClient.get<IResponseAPI<ICartResponse>>({
    url: "/api/customer/cart",
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["cart"] },
  });
  return response;
};

const deleteItemCart = async (productId: string, accessToken: string) => {
  const response = await apiClient.delete<IResponseAPI<any>>({
    url: `/api/customer/cart-item`,
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify([{ product_id: productId }]),
  });
  return response;
};

const deleteAllCart = async (accessToken: string) => {
  const response = await apiClient.delete<IResponseAPI<any>>({
    url: `/api/customer/cart`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};
const checkoutCart = async (
  data: ICheckoutRequest,
  accessToken: string
): Promise<IResponseAPI<ICheckoutResponse>> => {
  const response = await apiClient.post<IResponseAPI<ICheckoutResponse>>({
    url: "/api/customer/order",
    body: JSON.stringify(data),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const createOrderVnpay = async (orderCode: string, accessToken: string) => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: "/api/customer/order/vnpay",
    body: JSON.stringify({ order_code: orderCode }),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

export default {
  upsertCart,
  getCart,
  deleteItemCart,
  deleteAllCart,
  checkoutCart,
  createOrderVnpay,
};
