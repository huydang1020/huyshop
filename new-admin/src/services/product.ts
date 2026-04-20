import { request } from "../utils";

const url = "product-type";

const getListProductType = (data: IProductTypeRequest) => {
  return request
    .get<IApiResponse<IProductTypeResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createProductType = (data: IProductType) => {
  return request
    .post<IApiResponse<IProductType>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateProductType = (data: IProductType) => {
  return request
    .put<IApiResponse<IProductType>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateStateProductType = (id: string, state: string) => {
  return request
    .put<IApiResponse<IProductType>>(`${url}/state/${id}`, {
      json: { state },
      ignoreLoading: true,
    })
    .json();
};

const deleteProductType = (id: string) => {
  return request
    .delete<IApiResponse<IProductType>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export {
  getListProductType,
  createProductType,
  updateProductType,
  updateStateProductType,
  deleteProductType,
};
