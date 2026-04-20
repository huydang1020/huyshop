import { IOrder, IOrderRequest, IOrderResponse } from "#src/types/order.js";
import {
  IReviews,
  IReviewsRequest,
  IReviewsResponse,
} from "#src/types/reviews.js";
import { request } from "../utils";

const url = "reviews";

const getListReviews = (data: IReviewsRequest) => {
  return request
    .get<IApiResponse<IReviewsResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const updateReviews = (data: IReviews) => {
  return request
    .put<IApiResponse<IReviews>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

export { getListReviews, updateReviews };
