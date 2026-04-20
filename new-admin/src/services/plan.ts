import { IPlan, IPlanRequest, IPlanResponse } from "#src/types/plan.js";
import { request } from "../utils";

const url = "plan";

const getListPlan = (data: IPlanRequest) => {
  return request
    .get<IApiResponse<IPlanResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createPlan = (data: IPlan) => {
  return request
    .post<IApiResponse<IPlan>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updatePlan = (data: IPlan) => {
  return request
    .put<IApiResponse<IPlan>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deletePlan = (id: string) => {
  return request
    .delete<IApiResponse<IPlan>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListPlan, createPlan, updatePlan, deletePlan };
