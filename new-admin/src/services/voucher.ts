import { request } from "../utils";

const url = "voucher";

const getListVoucher = (data: IVoucherRequest) => {
  return request
    .get<IApiResponse<IVoucherResponse>>(url, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const createVoucher = (data: IVoucher) => {
  return request
    .post<IApiResponse<IVoucher>>(url, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const updateVoucher = (data: IVoucher) => {
  return request
    .put<IApiResponse<IVoucher>>(`${url}/${data.id}`, {
      json: data,
      ignoreLoading: true,
    })
    .json();
};

const deleteVoucher = (id: string) => {
  return request
    .delete<IApiResponse<IVoucher>>(`${url}/${id}`, { ignoreLoading: true })
    .json();
};

export { getListVoucher, createVoucher, updateVoucher, deleteVoucher };
