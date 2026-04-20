import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as partnerService from "#src/services/partner";
import { toastUtil } from "../components/toast";

type PartnerStore = {
  loading: boolean;
  partners: IPartner[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setPartners: (partners: IPartner[]) => void;
    setTotal: (total: number) => void;
    clearPartners: () => void;
  };
};

const usePartnerStore = create<PartnerStore>()((set) => ({
  loading: false,
  partners: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setPartners: (partners) => {
      set({ partners });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearPartners() {
      set({ partners: [] });
    },
  },
}));

export const usePartners = () => usePartnerStore((state) => state.partners);
export const usePartnerActions = () =>
  usePartnerStore((state) => state.actions);

export const useListPartner = () => {
  const { setPartners, setTotal, setLoading } = usePartnerActions();

  const partnerMutation = useMutation({
    mutationFn: partnerService.getListPartner,
  });

  const listPartner = async (params?: IPartnerRequest) => {
    try {
      setLoading(true);
      const res = await partnerMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { partners, total } = res.data;
      setPartners(partners);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listPartner ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listPartner;
};

export const useGetOnePartner = () => {
  const partnerMutation = useMutation({
    mutationFn: partnerService.getOnePartner,
  });

  const getOnePartner = async (id: string) => {
    try {
      const res = await partnerMutation.mutateAsync(id);
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      return res;
    } catch (err: any) {
      console.log("🚀 ~ getOnePartner ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return getOnePartner;
};

export const useCreatePartner = () => {
  const partnerMutation = useMutation({
    mutationFn: partnerService.createPartner,
  });

  const createPartner = async (data: IPartner) => {
    try {
      const res = await partnerMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createPartner ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createPartner;
};

export const useUpdatePartner = () => {
  const partnerMutation = useMutation({
    mutationFn: partnerService.updatePartner,
  });

  const updatePartner = async (data: IPartner) => {
    try {
      const res = await partnerMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updatePartner ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updatePartner;
};

export const useDeletePartner = () => {
  const partnerMutation = useMutation({
    mutationFn: partnerService.deletePartner,
  });
  const deletePartner = async (id: string) => {
    try {
      const res = await partnerMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deletePartner ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deletePartner;
};

export default usePartnerStore;
