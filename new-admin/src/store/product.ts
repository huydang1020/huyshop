import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as productService from "#src/services/product";
import { toastUtil } from "../components/toast";

type ProductStore = {
  loading: boolean;
  productTypes: IProductType[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setProductTypes: (productTypes: IProductType[]) => void;
    setTotal: (total: number) => void;
    clearProductTypes: () => void;
  };
};

const useProductStore = create<ProductStore>()((set) => ({
  loading: false,
  productTypes: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setProductTypes: (productTypes) => {
      set({ productTypes });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearProductTypes() {
      set({ productTypes: [] });
    },
  },
}));

export const useProductTypes = () =>
  useProductStore((state) => state.productTypes);
export const useProductTypeActions = () =>
  useProductStore((state) => state.actions);

export const useListProductType = () => {
  const { setProductTypes, setTotal, setLoading } = useProductTypeActions();

  const productTypeMutation = useMutation({
    mutationFn: productService.getListProductType,
  });

  const listProductType = async (params?: IProductTypeRequest) => {
    try {
      setLoading(true);
      const res = await productTypeMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { product_types, total } = res.data;
      setProductTypes(product_types);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listProductType ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listProductType;
};

export const useCreateProductType = () => {
  const productTypeMutation = useMutation({
    mutationFn: productService.createProductType,
  });

  const createProductType = async (data: IProductType) => {
    try {
      const res = await productTypeMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createProductType ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createProductType;
};

export const useUpdateProductType = () => {
  const productTypeMutation = useMutation({
    mutationFn: productService.updateProductType,
  });

  const updateProductType = async (data: IProductType) => {
    try {
      const res = await productTypeMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateProductType ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateProductType;
};

export const useUpdateStateProductType = () => {
  const productTypeMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) =>
      productService.updateStateProductType(id, state),
  });

  const updateStateProductType = async (id: string, state: string) => {
    try {
      const res = await productTypeMutation.mutateAsync({ id, state });
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateStateProductType ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateStateProductType;
};

export const useDeleteProductType = () => {
  const productTypeMutation = useMutation({
    mutationFn: productService.deleteProductType,
  });
  const deleteProductType = async (id: string) => {
    try {
      const res = await productTypeMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteProductType ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteProductType;
};

export default useProductStore;
