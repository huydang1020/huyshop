import { apiClient } from "@/utils/request";

const getListVoucher = async (
  query?: IVoucherRequest
): Promise<IResponseAPI<IVoucherResponse>> => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IVoucherResponse>>({
    url: `/api/customer/voucher?${queryParams.toString()}`,
    next: { tags: ["voucher-list"], revalidate: 30 },
  });
  return response;
};

const getListUserVoucher = async (
  accessToken: string,
  query?: IUserVoucherRequest
): Promise<IResponseAPI<IUserVoucherResponse>> => {
  const queryParams = new URLSearchParams(query as any);
  const response = await apiClient.get<IResponseAPI<IUserVoucherResponse>>({
    url: `/api/customer/voucher/user-voucher?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["user-voucher-list"] },
  });
  return response;
};

const getListUserVoucherFree = async (
  accessToken: string
): Promise<IResponseAPI<IUserVoucherResponse>> => {
  const response = await apiClient.get<IResponseAPI<IUserVoucherResponse>>({
    url: `/api/customer/voucher/user-voucher/free`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const getVoucher = async (id: string): Promise<IResponseAPI<IVoucher>> => {
  const response = await apiClient.get<IResponseAPI<IVoucher>>({
    url: `/api/customer/voucher/${id}`,
    next: { tags: ["voucher-detail"] },
  });
  return response;
};

const verifyCode = async (
  accessToken: string,
  data: IVerifyCodeRequest
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/voucher/verify-code`,
    body: JSON.stringify(data),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const buyVoucher = async (
  accessToken: string,
  voucher_id: string
): Promise<IResponseAPI<IVoucher>> => {
  const response = await apiClient.post<IResponseAPI<IVoucher>>({
    url: `/api/customer/voucher/buy`,
    body: JSON.stringify({
      voucher_id,
    }),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

export default {
  getListVoucher,
  getListUserVoucher,
  getListUserVoucherFree,
  getVoucher,
  verifyCode,
  buyVoucher,
};
