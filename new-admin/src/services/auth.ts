import { ISignInRequest, ISignInResponse, IUser } from "#src/types/user.js";
import { request } from "../utils";

const url = "user";

const signin = (data: ISignInRequest) => {
  return request
    .post<IApiResponse<ISignInResponse>>(`${url}/sign-in`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const signout = () => {
  return request
    .post<IApiResponse<any>>(`${url}/sign-out`, {
      ignoreLoading: true,
    })
    .json();
};

const getUserInfoFromToken = () => {
  return request.get<IApiResponse<IUser>>("me", { ignoreLoading: true }).json();
};

const getUserPage = () => {
  return request.get<any>(`${url}/page`, { ignoreLoading: true }).json();
};

export { signin, signout, getUserPage, getUserInfoFromToken };
