import { apiClient } from "@/utils/request";

const uploadImage = async (data: FormData) => {
  const resp = await apiClient.post<IResponseAPI<string[]>>({
    url: `/api/customer/upload-image`,
    body: data,
  });
  return resp;
};

export default { uploadImage };
