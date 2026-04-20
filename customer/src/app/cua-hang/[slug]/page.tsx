import StoreDetail from "@/components/store-info";
import productService from "@/services/product.service";
import { cookies } from "next/headers";

export default async function StoreInfoPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const accessToken = cookies().get("access_token")?.value;

  const promises: Promise<any>[] = [productService.getInfoStore(slug)];

  if (accessToken) {
    promises.push(productService.getListFavoriteProduct(accessToken));
  }

  const results = await Promise.all(promises);
  const resp = results[0];
  const listFavoriteProduct = results[1] || [];

  return (
    <StoreDetail
      data={resp.data || {}}
      listFavoriteProduct={listFavoriteProduct.data?.product_types || []}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const response = await productService.getInfoStore(params.slug);
  const store = response.data || {};
  return {
    title: `Cửa hàng ${store.store.name}`,
  };
}
