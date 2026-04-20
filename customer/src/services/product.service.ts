import { apiClient } from "@/utils/request";

const listProductType = async (
  query?: IQueryProductType
): Promise<IResponseAPI<IDataProductType>> => {
  // Filter out undefined values to prevent "category=undefined" in query string
  const filteredQuery: any = {};
  if (query) {
    Object.keys(query).forEach((key) => {
      const value = (query as any)[key];
      if (value !== undefined) {
        filteredQuery[key] = value;
      }
    });
  }
  const queryParams = new URLSearchParams(filteredQuery as any);
  const response = await apiClient.get<IResponseAPI<IDataProductType>>({
    url: `/api/customer/product-type?${queryParams.toString()}`,
    next: { tags: ["product-type"], revalidate: 30 },
  });
  return response;
};

const getProductType = async (
  slug: string
): Promise<IResponseAPI<IProductType>> => {
  const response = await apiClient.get<IResponseAPI<IProductType>>({
    url: `/api/customer/product-type/${slug}`,
  });
  return response;
};

const createFavoriteProduct = async (
  productId: string,
  accessToken: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.post<IResponseAPI<any>>({
    url: `/api/customer/favorite-product`,
    body: JSON.stringify({ product_type_id: productId }),
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const getListFavoriteProduct = async (
  accessToken: string,
  query?: IQueryProductType
): Promise<IResponseAPI<IListFavoriteProductResponse>> => {
  // Filter out undefined values to prevent "category=undefined" in query string
  const filteredQuery: any = {};
  if (query) {
    Object.keys(query).forEach((key) => {
      const value = (query as any)[key];
      if (value !== undefined) {
        filteredQuery[key] = value;
      }
    });
  }
  const queryParams = new URLSearchParams(filteredQuery);
  const response = await apiClient.get<
    IResponseAPI<IListFavoriteProductResponse>
  >({
    url: `/api/customer/favorite-product?${queryParams.toString()}`,
    headers: {
      "access-token": accessToken,
    },
    next: { tags: ["favorite-product"] },
  });
  return response;
};

const deleteOneFavoriteProduct = async (
  productId: string,
  accessToken: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.delete<IResponseAPI<any>>({
    url: `/api/customer/favorite-product/${productId}`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const deleteAllFavoriteProduct = async (
  accessToken: string
): Promise<IResponseAPI<any>> => {
  const response = await apiClient.delete<IResponseAPI<any>>({
    url: `/api/customer/favorite-product`,
    headers: {
      "access-token": accessToken,
    },
  });
  return response;
};

const listCategory = async (
  query?: ICategoryRequest
): Promise<IResponseAPI<ICategoryResponse>> => {
  // Filter out undefined values to prevent undefined parameters in query string
  const filteredQuery: any = {};
  if (query) {
    Object.keys(query).forEach((key) => {
      const value = (query as any)[key];
      if (value !== undefined) {
        filteredQuery[key] = value;
      }
    });
  }
  const queryParams = new URLSearchParams(filteredQuery);
  const response = await apiClient.get<IResponseAPI<ICategoryResponse>>({
    url: `/api/customer/category?${queryParams.toString()}`,
  });
  return response;
};

const getInfoStore = async (
  slug: string
): Promise<IResponseAPI<IStoreInfoResponse>> => {
  const response = await apiClient.get<IResponseAPI<IStoreInfoResponse>>({
    url: `/api/customer/store/${slug}`,
  });
  return response;
};

export default {
  listProductType,
  getProductType,
  createFavoriteProduct,
  getListFavoriteProduct,
  deleteOneFavoriteProduct,
  deleteAllFavoriteProduct,
  listCategory,
  getInfoStore,
};
