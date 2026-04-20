import * as orderPlanService from "#src/services/order-plan";
import {
  ICreateOrderPlanRequest,
  IOrderPlan,
  IOrderPlanRequest,
} from "#src/types/plan.js";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { toastUtil } from "../components/toast";

type OrderPlanStore = {
  loading: boolean;
  orderPlans: IOrderPlan[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setOrderPlans: (orderPlans: IOrderPlan[]) => void;
    setTotal: (total: number) => void;
    clearOrderPlans: () => void;
  };
};

const useOrderPlanStore = create<OrderPlanStore>()((set) => ({
  loading: false,
  orderPlans: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setOrderPlans: (orderPlans) => {
      set({ orderPlans });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearOrderPlans() {
      set({ orderPlans: [] });
    },
  },
}));

export const useOrderPlans = () =>
  useOrderPlanStore((state) => state.orderPlans);
export const useOrderPlanActions = () =>
  useOrderPlanStore((state) => state.actions);

export const useListOrderPlan = () => {
  const { setOrderPlans, setTotal, setLoading } = useOrderPlanActions();

  const orderPlanMutation = useMutation({
    mutationFn: orderPlanService.getListOrderPlan,
  });

  const listOrderPlan = async (params?: IOrderPlanRequest) => {
    try {
      setLoading(true);
      const res = await orderPlanMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { order_plans, total } = res.data;
      setOrderPlans(order_plans);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listOrderPlan ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listOrderPlan;
};

export const useCreateOrderPlan = () => {
  const { setLoading } = useOrderPlanActions();

  const createOrderPlanMutation = useMutation({
    mutationFn: orderPlanService.createOrderPlan,
  });

  const createOrderPlan = async (params: ICreateOrderPlanRequest) => {
    try {
      setLoading(true);
      const res = await createOrderPlanMutation.mutateAsync(params);
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createOrderPlan ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return createOrderPlan;
};

export const useCreateOrderPlanVnpay = () => {
  const { setLoading } = useOrderPlanActions();

  const createOrderPlanVnpayMutation = useMutation({
    mutationFn: orderPlanService.createOrderPlanVnpay,
  });

  const createOrderPlanVnpay = async (order_code: string) => {
    try {
      setLoading(true);
      const res = await createOrderPlanVnpayMutation.mutateAsync(order_code);
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createOrderPlanVnpay ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createOrderPlanVnpay;
};
export default useOrderPlanStore;
