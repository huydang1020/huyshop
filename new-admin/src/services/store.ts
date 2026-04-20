import { request } from "../utils";

const url = "store";

const getListStore = (data: IStoreRequest) => {
  return request
    .get<IApiResponse<IStoreResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createStore = (data: IStore) => {
  return request
    .post<IApiResponse<IStore>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateStore = (data: IStore) => {
  return request
    .put<IApiResponse<IStore>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deleteStore = (id: string) => {
  return request
    .delete<IApiResponse<IStore>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListStore, createStore, updateStore, deleteStore };
