import LoginRequiredPage from "@/components/login-required";
import ProductFavourite from "@/components/product-favourite";
import productService from "@/services/product.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích",
  description: "Sản phẩm yêu thích",
};

export default async function ProductFavoritePage() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return <LoginRequiredPage page_redirect="san-pham-yeu-thich" />;
  }
  let listFavoriteProduct: IProductType[] = [];
  let total = 0;
  const resp = await productService.getListFavoriteProduct(accessToken, {
    limit: 12,
    skip: 0,
  });
  if (resp.code === 0) {
    listFavoriteProduct = resp.data.product_types;
    total = resp.data.total;
  }
  return (
    <ProductFavourite
      listFavoriteProduct={listFavoriteProduct || []}
      total={total}
    />
  );
}
