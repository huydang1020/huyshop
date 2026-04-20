import { request } from "../utils";

const url = "partner";

const getListPartner = (data: IPartnerRequest) => {
  return request
    .get<IApiResponse<IPartnerResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const getOnePartner = (id: string) => {
  return request
    .get<IApiResponse<IPartner>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

const createPartner = (data: IPartner) => {
  return request
    .post<IApiResponse<IPartner>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updatePartner = (data: IPartner) => {
  return request
    .put<IApiResponse<IPartner>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deletePartner = (id: string) => {
  return request
    .delete<IApiResponse<IPartner>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export {
  getListPartner,
  createPartner,
  updatePartner,
  deletePartner,
  getOnePartner,
};
