import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as storeService from "#src/services/store";
import { toastUtil } from "../components/toast";

type StoreStore = {
  loading: boolean;
  stores: IStore[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setStores: (stores: IStore[]) => void;
    setTotal: (total: number) => void;
    clearStores: () => void;
  };
};

const useStoreStore = create<StoreStore>()((set) => ({
  loading: false,
  stores: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setStores: (stores) => {
      set({ stores });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearStores() {
      set({ stores: [] });
    },
  },
}));

export const useStores = () => useStoreStore((state) => state.stores);
export const useStoreActions = () => useStoreStore((state) => state.actions);

export const useListStore = () => {
  const { setStores, setTotal, setLoading } = useStoreActions();

  const storeMutation = useMutation({
    mutationFn: storeService.getListStore,
  });

  const listStore = async (params?: IStoreRequest) => {
    try {
      setLoading(true);
      const res = await storeMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { stores, total } = res.data;
      setStores(stores);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listStore ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listStore;
};

export const useCreateStore = () => {
  const storeMutation = useMutation({
    mutationFn: storeService.createStore,
  });

  const createStore = async (data: IStore) => {
    try {
      const res = await storeMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createStore ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createStore;
};

export const useUpdateStore = () => {
  const storeMutation = useMutation({
    mutationFn: storeService.updateStore,
  });

  const updateStore = async (data: IStore) => {
    try {
      const res = await storeMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateStore ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateStore;
};

export const useDeleteStore = () => {
  const storeMutation = useMutation({
    mutationFn: storeService.deleteStore,
  });
  const deleteStore = async (id: string) => {
    try {
      const res = await storeMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteStore ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteStore;
};

export default useStoreStore;
