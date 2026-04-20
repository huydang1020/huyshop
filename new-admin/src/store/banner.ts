import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as bannerService from "#src/services/banner";
import { toastUtil } from "../components/toast";

type BannerStore = {
  loading: boolean;
  banners: IBanner[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setBanners: (banners: IBanner[]) => void;
    setTotal: (total: number) => void;
    clearBanners: () => void;
  };
};

const useBannerStore = create<BannerStore>()((set) => ({
  loading: false,
  banners: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setBanners: (banners) => {
      set({ banners });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearBanners() {
      set({ banners: [] });
    },
  },
}));

export const useBanners = () => useBannerStore((state) => state.banners);
export const useBannerActions = () => useBannerStore((state) => state.actions);

export const useListBanner = () => {
  const { setBanners, setTotal, setLoading } = useBannerActions();

  const bannerMutation = useMutation({
    mutationFn: bannerService.getListBanner,
  });

  const listBanner = async (params?: IBannerRequest) => {
    try {
      setLoading(true);
      const res = await bannerMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { banners, total } = res.data;
      setBanners(banners);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listBanner ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listBanner;
};

export const useCreateBanner = () => {
  const bannerMutation = useMutation({
    mutationFn: bannerService.createBanner,
  });

  const createBanner = async (data: IBanner) => {
    try {
      const res = await bannerMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createBanner ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createBanner;
};

export const useUpdateBanner = () => {
  const bannerMutation = useMutation({
    mutationFn: bannerService.updateBanner,
  });

  const updateBanner = async (data: IBanner) => {
    try {
      const res = await bannerMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateBanner ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateBanner;
};

export const useDeleteBanner = () => {
  const bannerMutation = useMutation({
    mutationFn: bannerService.deleteBanner,
  });
  const deleteBanner = async (id: string) => {
    try {
      const res = await bannerMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteBanner ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteBanner;
};

export default useBannerStore;
