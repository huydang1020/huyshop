import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { toastUtil } from "../components/toast";
import { IOrder, IOrderRequest } from "#src/types/order.js";
import * as orderService from "#src/services/order";

type OrderStore = {
  loading: boolean;
  orders: IOrder[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setOrders: (orders: IOrder[]) => void;
    setTotal: (total: number) => void;
    clearOrders: () => void;
  };
};

const useOrderStore = create<OrderStore>()((set) => ({
  loading: false,
  orders: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setOrders: (orders) => {
      set({ orders });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearOrders() {
      set({ orders: [] });
    },
  },
}));

export const useOrders = () => useOrderStore((state) => state.orders);
export const useOrderActions = () => useOrderStore((state) => state.actions);

export const useListOrder = () => {
  const { setOrders, setTotal, setLoading } = useOrderActions();

  const orderMutation = useMutation({
    mutationFn: orderService.getListOrder,
  });

  const listOrder = async (params?: IOrderRequest) => {
    try {
      setLoading(true);
      const res = await orderMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { orders, total } = res.data;
      setOrders(orders);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listOrder ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listOrder;
};

export const useUpdateOrder = () => {
  const orderMutation = useMutation({
    mutationFn: orderService.updateOrder,
  });

  const updateOrder = async (data: IOrder) => {
    try {
      const res = await orderMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateOrder ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateOrder;
};

export default useOrderStore;
