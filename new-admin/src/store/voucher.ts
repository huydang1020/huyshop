import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as voucherService from "#src/services/voucher";
import { toastUtil } from "../components/toast";

type VoucherStore = {
  loading: boolean;
  vouchers: IVoucher[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setVouchers: (vouchers: IVoucher[]) => void;
    setTotal: (total: number) => void;
    clearVouchers: () => void;
  };
};

const useVoucherStore = create<VoucherStore>()((set) => ({
  loading: false,
  vouchers: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setVouchers: (vouchers) => {
      set({ vouchers });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearVouchers() {
      set({ vouchers: [] });
    },
  },
}));

export const useVouchers = () => useVoucherStore((state) => state.vouchers);
export const useVoucherActions = () =>
  useVoucherStore((state) => state.actions);

export const useListVoucher = () => {
  const { setVouchers, setTotal, setLoading } = useVoucherActions();

  const voucherMutation = useMutation({
    mutationFn: voucherService.getListVoucher,
  });

  const listVoucher = async (params?: IVoucherRequest) => {
    try {
      setLoading(true);
      const res = await voucherMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { vouchers, total } = res.data;
      setVouchers(vouchers);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listVoucher ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listVoucher;
};

export const useCreateVoucher = () => {
  const voucherMutation = useMutation({
    mutationFn: voucherService.createVoucher,
  });

  const createVoucher = async (data: IVoucher) => {
    try {
      const res = await voucherMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createVoucher ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createVoucher;
};

export const useUpdateVoucher = () => {
  const voucherMutation = useMutation({
    mutationFn: voucherService.updateVoucher,
  });

  const updateVoucher = async (data: IVoucher) => {
    try {
      const res = await voucherMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateVoucher ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateVoucher;
};

export const useDeleteVoucher = () => {
  const voucherMutation = useMutation({
    mutationFn: voucherService.deleteVoucher,
  });
  const deleteVoucher = async (id: string) => {
    try {
      const res = await voucherMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteVoucher ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteVoucher;
};

export default useVoucherStore;
``;
