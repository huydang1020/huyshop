import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as categoryService from "#src/services/category";
import { toastUtil } from "../components/toast";

type CategoryStore = {
  loading: boolean;
  categories: ICategory[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setCategories: (categories: ICategory[]) => void;
    setTotal: (total: number) => void;
    clearCategories: () => void;
  };
};

const useCategoryStore = create<CategoryStore>()((set) => ({
  loading: false,
  categories: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setCategories: (categories) => {
      set({ categories });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearCategories() {
      set({ categories: [] });
    },
  },
}));

export const useCategories = () =>
  useCategoryStore((state) => state.categories);
export const useCategoryActions = () =>
  useCategoryStore((state) => state.actions);

export const useListCategory = () => {
  const { setCategories, setTotal, setLoading } = useCategoryActions();

  const categoryMutation = useMutation({
    mutationFn: categoryService.getListCategory,
  });

  const listCategory = async (params?: ICategoryRequest) => {
    try {
      setLoading(true);
      const res = await categoryMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { categories, total } = res.data;
      setCategories(categories);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listCategory ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listCategory;
};

export const useCreateCategory = () => {
  const categoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
  });

  const createCategory = async (data: ICategory) => {
    try {
      const res = await categoryMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createCategory ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createCategory;
};

export const useUpdateCategory = () => {
  const categoryMutation = useMutation({
    mutationFn: categoryService.updateCategory,
  });

  const updateCategory = async (data: ICategory) => {
    try {
      const res = await categoryMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateCategory ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateCategory;
};

export const useDeleteCategory = () => {
  const categoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
  });
  const deleteCategory = async (id: string) => {
    try {
      const res = await categoryMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteCategory ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteCategory;
};

export default useCategoryStore;
