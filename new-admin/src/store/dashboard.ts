import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { toastUtil } from "../components/toast";
import * as dashboardService from "#src/services/dashboard";

type DashboardStore = {
  loading: boolean;
  overview: IOverview;
  revenue: IRevenue;
  reportProductHighestViews: IReportProductResponse;
  reportProductHighestSales: IReportProductResponse;
  actions: {
    setLoading: (loading: boolean) => void;
    setOverview: (overview: IOverview) => void;
    setRevenue: (revenue: IRevenue) => void;
    setReportProductHighestViews: (
      reportProduct: IReportProductResponse
    ) => void;
    setReportProductHighestSales: (
      reportProduct: IReportProductResponse
    ) => void;
  };
};

const useDashboardStore = create<DashboardStore>()((set) => ({
  loading: false,
  overview: {
    total_product: 0,
    total_partners: 0,
    total_revenue: 0,
    total_orders: 0,
    total_users: 0,
    total_stores: 0,
    total_vouchers: 0,
    total_code_used: 0,
    order_status: {
      cancelled: 0,
      confirmed: 0,
      pending: 0,
      shipping: 0,
      completed: 0,
      processing: 0,
    },
  },
  revenue: {
    labels: [],
    values: [],
  },
  reportProductHighestViews: {
    data: {},
  },
  reportProductHighestSales: {
    data: {},
  },
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setOverview: (overview) => {
      set({ overview });
    },
    setRevenue: (revenue) => {
      set({ revenue });
    },
    setReportProductHighestViews: (reportProduct) => {
      set({ reportProductHighestViews: reportProduct });
    },
    setReportProductHighestSales: (reportProduct) => {
      set({ reportProductHighestSales: reportProduct });
    },
  },
}));

export const useOverview = () => useDashboardStore((state) => state.overview);
export const useDashboardActions = () =>
  useDashboardStore((state) => state.actions);

export const useGetOverview = () => {
  const { setOverview, setLoading } = useDashboardActions();

  const orderMutation = useMutation({
    mutationFn: dashboardService.getOverview,
  });

  const getOverview = async (params?: IOverviewRequest) => {
    try {
      setLoading(true);
      const res = await orderMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      setOverview(res.data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ getOverview ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return getOverview;
};

export const useGetRevenue = () => {
  const { setRevenue, setLoading } = useDashboardActions();

  const revenueMutation = useMutation({
    mutationFn: dashboardService.getRevenue,
  });

  const getRevenueByMonth = async (params?: IRevenueRequest) => {
    try {
      setLoading(true);
      const res = await revenueMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      setRevenue(res.data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ getRevenue ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return getRevenueByMonth;
};

export const useGetReportProductHighestViews = () => {
  const { setReportProductHighestViews, setLoading } = useDashboardActions();

  const reportProductMutation = useMutation({
    mutationFn: dashboardService.getReportProduct,
  });

  const getReportProductHighestViews = async (
    params?: IReportProductRequest
  ) => {
    try {
      setLoading(true);
      const res = await reportProductMutation.mutateAsync({
        ...params,
        order_by: "views",
      });
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      setReportProductHighestViews(res.data as any);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ getReportProduct ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return getReportProductHighestViews;
};

export const useGetReportProductHighestSales = () => {
  const { setReportProductHighestSales, setLoading } = useDashboardActions();

  const reportProductMutation = useMutation({
    mutationFn: dashboardService.getReportProduct,
  });

  const getReportProductHighestViews = async (
    params?: IReportProductRequest
  ) => {
    try {
      setLoading(true);
      const res = await reportProductMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      setReportProductHighestSales(res.data as any);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ getReportProduct ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return getReportProductHighestViews;
};

export default useDashboardStore;
