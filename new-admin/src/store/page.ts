import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as PageService from "#src/services/page";
import { toastUtil } from "#src/components/toast";
import { IPage, IPageRequest } from "#src/types/page.js";

type PageStore = {
  loading: boolean;
  pages: Partial<IPage[]>;
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setPages: (pages: IPage[]) => void;
    setTotal: (total: number) => void;
    clearPages: () => void;
  };
};

const usePageStore = create<PageStore>()((set) => ({
  loading: false,
  pages: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setPages: (pages) => {
      set({ pages: pages });
    },
    setTotal: (total) => {
      set({ total: total });
    },
    clearPages() {
      set({ pages: [] });
    },
  },
}));

export const usePages = () => usePageStore((state) => state.pages);

export const usePagesActions = () => usePageStore((state) => state.actions);

export const useListPage = () => {
  const { setPages, setTotal, setLoading } = usePagesActions();

  const pageMutation = useMutation({
    mutationFn: PageService.getListPage,
  });

  const listPage = async (params?: IPageRequest) => {
    try {
      setLoading(true);
      const res = await pageMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { pages, total } = res.data;
      setPages(pages);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listPage ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listPage;
};

export const useCreatePage = () => {
  const pageMutation = useMutation({
    mutationFn: PageService.createPage,
  });

  const createPage = async (data: IPage) => {
    try {
      const res = await pageMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createPage ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createPage;
};

export const useUpdatePage = () => {
  const pageMutation = useMutation({
    mutationFn: PageService.updatePage,
  });

  const updatePage = async (data: IPage) => {
    try {
      const res = await pageMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updatePage ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updatePage;
};

export const useDeletePage = () => {
  const pageMutation = useMutation({
    mutationFn: PageService.deletePage,
  });
  const deletePage = async (id: string) => {
    try {
      const res = await pageMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deletePage ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deletePage;
};

export default usePageStore;
