import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as planService from "#src/services/plan";
import { toastUtil } from "../components/toast";
import { IPlan, IPlanRequest } from "#src/types/plan.js";

type PlanStore = {
  loading: boolean;
  plans: IPlan[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setPlans: (plans: IPlan[]) => void;
    setTotal: (total: number) => void;
    clearPlans: () => void;
  };
};

const usePlanStore = create<PlanStore>()((set) => ({
  loading: false,
  plans: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setPlans: (plans) => {
      set({ plans });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearPlans() {
      set({ plans: [] });
    },
  },
}));

export const usePlans = () => usePlanStore((state) => state.plans);
export const usePlanActions = () => usePlanStore((state) => state.actions);

export const useListPlan = () => {
  const { setPlans, setTotal, setLoading } = usePlanActions();

  const planMutation = useMutation({
    mutationFn: planService.getListPlan,
  });

  const listPlan = async (params?: IPlanRequest) => {
    try {
      setLoading(true);
      const res = await planMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { plans, total } = res.data;
      setPlans(plans);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listPlan ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listPlan;
};

export const useCreatePlan = () => {
  const planMutation = useMutation({
    mutationFn: planService.createPlan,
  });

  const createPlan = async (data: IPlan) => {
    try {
      const res = await planMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createPlan ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createPlan;
};

export const useUpdatePlan = () => {
  const planMutation = useMutation({
    mutationFn: planService.updatePlan,
  });

  const updatePlan = async (data: IPlan) => {
    try {
      const res = await planMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updatePlan ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updatePlan;
};

export const useDeletePlan = () => {
  const planMutation = useMutation({
    mutationFn: planService.deletePlan,
  });
  const deletePlan = async (id: string) => {
    try {
      const res = await planMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deletePlan ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deletePlan;
};

export default usePlanStore;
