import ProductListing from "@/components/product-listing";
import productService from "@/services/product.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Sản phẩm",
};

export default async function ProductPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParams.search as string;
  const categorySlug = searchParams.category as string;

  const accessToken = cookies().get("access_token")?.value;

  // Tạo array các promises để chạy song song
  const promises: Promise<any>[] = [
    productService.listProductType({
      state: "active",
      limit: 15,
      skip: 0,
      category: categorySlug, // Thêm filter category nếu có
      name: search, // Thêm filter search keyword nếu có
    }),
    productService.listCategory({
      state: "active",
    }),
  ];

  // Chỉ thêm favorite product request nếu có access token
  if (accessToken) {
    promises.push(productService.getListFavoriteProduct(accessToken));
  }

  // Chạy tất cả promises song song
  const results = await Promise.all(promises);
  const listProductType = results[0];
  const listCategory = results[1];

  let listFavoriteProduct: IProductType[] = [];
  if (accessToken && results[2]) {
    const favoriteResp = results[2];
    if (favoriteResp.code === 0 && favoriteResp.data) {
      listFavoriteProduct = favoriteResp.data.product_types;
    }
  }

  return (
    <ProductListing
      data={listProductType.data || { product_types: [], total: 0 }}
      listFavoriteProduct={listFavoriteProduct || []}
      listCategory={listCategory.data || { categories: [], total: 0 }}
      initialCategorySlug={categorySlug}
      initialSearchKeyword={search}
    />
  );
}
