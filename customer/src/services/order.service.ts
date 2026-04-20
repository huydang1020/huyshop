import { apiClient } from "@/utils/request";

const getListOrderOfCustomer = async (
  accessToken: string,
  query?: IOrderRequest
): Promise<IResponseAPI<IOrderResponse>> => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IOrderResponse>>({
    url: `/api/customer/order?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const cancelOrder = async (
  accessToken: string,
  orderId: string,
  data: {
    cancel_reason: string;
  }
) => {
  const response = await apiClient.post<IResponseAPI<IOrderResponse>>({
    url: `/api/customer/order/${orderId}/cancel`,
    body: JSON.stringify(data),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const rateProduct = async (
  accessToken: string,
  data: {
    order_id: string;
    product_id: string;
    rating: number;
    content: string;
    images?: string[];
  }
) => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/reviews`,
    body: JSON.stringify(data),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const getListReviewsOfCustomer = async (
  accessToken: string,
  query?: IReviewRequest
) => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IReviewResponse>>({
    url: `/api/customer/reviews-of-customer?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const getListReviewsOfProductType = async (
  productTypeId: string,
  query?: IReviewRequest
) => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IReviewResponse>>({
    url: `/api/customer/reviews?product_type_id=${productTypeId}&${queryParams.toString()}`,
    next: { revalidate: 30 },
  });
  return response;
};
export default {
  getListOrderOfCustomer,
  cancelOrder,
  rateProduct,
  getListReviewsOfCustomer,
  getListReviewsOfProductType,
};
