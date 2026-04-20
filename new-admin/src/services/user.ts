import { IUser, IUserRequest, IUserResponse } from "#src/types/user.js";
import { request } from "../utils";

const url = "user";

const getListUser = (data: IUserRequest) => {
  return request
    .get<IApiResponse<IUserResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createUser = (data: IUser) => {
  return request
    .post<IApiResponse<IUser>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateUser = (data: IUser) => {
  return request
    .put<IApiResponse<IUser>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deleteUser = (id: string) => {
  return request
    .delete<IApiResponse<IUser>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListUser, createUser, updateUser, deleteUser };
