import { request } from "../utils";

const url = "banner";

const getListBanner = (data: IBannerRequest) => {
  return request
    .get<IApiResponse<IBannerResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createBanner = (data: IBanner) => {
  return request
    .post<IApiResponse<IBanner>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateBanner = (data: IBanner) => {
  return request
    .put<IApiResponse<IBanner>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deleteBanner = (id: string) => {
  return request
    .delete<IApiResponse<IBanner>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListBanner, createBanner, updateBanner, deleteBanner };
