import { apiClient } from "@/utils/request";

const getDataHomePage = async (): Promise<IResponseAPI<IDataHomePage>> => {
  const response = await apiClient.get<IResponseAPI<IDataHomePage>>({
    url: "/api/customer/home",
    next: { revalidate: 30 },
  });
  return response;
};

export default { getDataHomePage };
