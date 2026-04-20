import { IPage, IPageRequest, IPageResponse } from "#src/types/page.js";
import { request } from "../utils";

const url = "page";

const getListPage = (data: IPageRequest) => {
  return request
    .get<IApiResponse<IPageResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createPage = (data: IPage) => {
  return request
    .post<IApiResponse<IPage>>(url, { json: data, ignoreLoading: true })
    .json();
};

const updatePage = (data: IPage) => {
  return request
    .put<IApiResponse<IPage>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deletePage = (id: string) => {
  return request
    .delete<IApiResponse<IPage>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListPage, createPage, updatePage, deletePage };
