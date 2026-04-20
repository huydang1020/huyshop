import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { toastUtil } from "../components/toast";
import { IOrder, IOrderRequest } from "#src/types/order.js";
import * as pointService from "#src/services/point";
import {
  IPointTransaction,
  IPointTransactionRequest,
} from "#src/types/point.js";

type PointStore = {
  loading: boolean;
  pointTransactions: IPointTransaction[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setPointTransactions: (pointTransactions: IPointTransaction[]) => void;
    setTotal: (total: number) => void;
    clearPointTransactions: () => void;
  };
};

const usePointStore = create<PointStore>()((set) => ({
  loading: false,
  pointTransactions: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setPointTransactions: (pointTransactions) => {
      set({ pointTransactions });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearPointTransactions() {
      set({ pointTransactions: [] });
    },
  },
}));

export const usePointTransactions = () =>
  usePointStore((state) => state.pointTransactions);
export const usePointActions = () => usePointStore((state) => state.actions);

export const useListPointTransaction = () => {
  const { setPointTransactions, setTotal, setLoading } = usePointActions();

  const pointTransactionMutation = useMutation({
    mutationFn: pointService.getPointTransaction,
  });

  const listPointTransaction = async (params?: IPointTransactionRequest) => {
    try {
      setLoading(true);
      const res = await pointTransactionMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { point_exchanges, total } = res.data;
      setPointTransactions(point_exchanges);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listPointTransaction ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listPointTransaction;
};

export default usePointStore;
