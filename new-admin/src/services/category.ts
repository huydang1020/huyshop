import { request } from "../utils";

const url = "category";

const getListCategory = (data: ICategoryRequest) => {
  return request
    .get<IApiResponse<ICategoryResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createCategory = (data: ICategory) => {
  return request
    .post<IApiResponse<ICategory>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateCategory = (data: ICategory) => {
  return request
    .put<IApiResponse<ICategory>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deleteCategory = (id: string) => {
  return request
    .delete<IApiResponse<ICategory>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListCategory, createCategory, updateCategory, deleteCategory };
