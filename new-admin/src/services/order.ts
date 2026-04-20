import { IOrder, IOrderRequest, IOrderResponse } from "#src/types/order.js";
import { request } from "../utils";

const url = "order";

const getListOrder = (data: IOrderRequest) => {
  return request
    .get<IApiResponse<IOrderResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const updateOrder = (data: IOrder) => {
  return request
    .put<IApiResponse<IOrder>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

export { getListOrder, updateOrder };
