import { request } from "../utils";

const url = "upload-image";

const uploadImage = (data: FormData) => {
  return request
    .post<IApiResponse<string[]>>(url, {
      body: data,
      ignoreLoading: true,
    })
    .json();
};

export { uploadImage };
