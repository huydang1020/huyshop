import { apiClient } from "@/utils/request";

const getUser = async (accessToken: string) => {
  const response = await apiClient.get<IResponseAPI<IUser>>({
    url: "/api/customer/me",
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["user-info"] },
  });
  return response;
};

const signIn = async (data: ISignInRequest) => {
  const response = await apiClient.post<IResponseAPI<ISignInResponse>>({
    url: "/api/customer/sign-in",
    body: JSON.stringify(data),
  });
  return response;
};

const signInAfterVerifyOtp = async (data: ISignInRequest) => {
  const response = await apiClient.post<IResponseAPI<ISignInResponse>>({
    url: "/api/customer/sign-in-after-verify-otp",
    body: JSON.stringify(data),
  });
  return response;
};

const signUp = async (data: IUser) => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: "/api/customer/sign-up",
    body: JSON.stringify(data),
  });
  return response;
};

const signOut = async (accessToken: string) => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: "/api/customer/sign-out",
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

export default { signIn, signInAfterVerifyOtp, signUp, signOut, getUser };
