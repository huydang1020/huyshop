import { request } from "../utils";

const url = "report";

const getOverview = (data: IOverviewRequest) => {
  return request
    .get<IApiResponse<IOverview>>(`${url}/overview`, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const getRevenue = (data: IRevenueRequest) => {
  return request
    .get<IApiResponse<IRevenue>>(`${url}/revenue`, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};

const getReportProduct = (data: IReportProductRequest) => {
  return request
    .get<IApiResponse<IProduct>>(`${url}/product`, {
      searchParams: { ...data },
      ignoreLoading: true,
    })
    .json();
};
export { getOverview, getRevenue, getReportProduct };
