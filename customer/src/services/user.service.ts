import { apiClient } from "@/utils/request";

const sendOtp = async (
  data: ISendOtpRequest
): Promise<IResponseAPI<ISendOtpResponse>> => {
  const response = await apiClient.post<IResponseAPI<ISendOtpResponse>>({
    url: `/api/customer/send-otp`,
    body: JSON.stringify(data),
  });
  return response;
};

const verifyOtp = async (data: ISendOtpRequest): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/verify-otp`,
    body: JSON.stringify(data),
  });
  return response;
};

const getListUserAddress = async (
  accessToken: string,
  query?: IUserAddressRequest
): Promise<IResponseAPI<IUserAddressResponse>> => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IUserAddressResponse>>({
    url: `/api/customer/user-address?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["user-address-list"] },
  });
  return response;
};

const createUserAddress = async (
  accessToken: string,
  data: IUserAddress
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/user-address`,
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify(data),
  });
  return response;
};

const updateUserAddress = async (
  accessToken: string,
  id: string,
  data: IUserAddress
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.put<IResponseAPI<any>>({
    url: `/api/customer/user-address/${id}`,
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify(data),
  });
  return response;
};

const deleteUserAddress = async (
  accessToken: string,
  id: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.delete<IResponseAPI<any>>({
    url: `/api/customer/user-address/${id}`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const updateProfile = async (
  accessToken: string,
  data: IUser
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/update-profile`,
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify(data),
  });
  return response;
};

const changePassword = async (
  accessToken: string,
  old_password: string,
  new_password: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/change-password`,
    headers: {
      "access-token": accessToken,
    },
    body: JSON.stringify({ old_password, new_password }),
  });
  return response;
};

const listPointExchange = async (
  accessToken: string,
  query?: IPointExchangeRequest
): Promise<IResponseAPI<IPointExchangeResponse>> => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IPointExchangeResponse>>({
    url: `/api/customer/point-exchange?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["point-exchange-list"] },
  });
  return response;
};

export default {
  sendOtp,
  verifyOtp,
  getListUserAddress,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateProfile,
  changePassword,
  listPointExchange,
};
