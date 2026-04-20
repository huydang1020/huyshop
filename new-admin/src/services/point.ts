import {
  IPointTransactionRequest,
  IPointTransactionResponse,
} from "#src/types/point.js";
import { request } from "../utils";

const url = "user/point-exchange";

const getPointTransaction = (data: IPointTransactionRequest) => {
  return request
    .get<IApiResponse<IPointTransactionResponse>>(`${url}`, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

export { getPointTransaction };
