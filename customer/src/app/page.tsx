import HomeComponent from "@/components/home";
import homeService from "@/services/home.service";
import productService from "@/services/product.service";
import { cookies } from "next/headers";

export default async function Home() {
  const getProductTypeList = (query: any) =>
    productService.listProductType(query);

  const accessToken = cookies().get("access_token")?.value;

  const promises: Promise<any>[] = [
    homeService.getDataHomePage(),
    getProductTypeList({ limit: 10, skip: 0, order_by: "sold" }),
    getProductTypeList({ limit: 10, skip: 0, order_by: "views" }),
    getProductTypeList({ limit: 10, skip: 0, order_by: "rating" }),
  ];

  if (accessToken) {
    promises.push(productService.getListFavoriteProduct(accessToken));
  }

  const results = await Promise.all(promises);
  let listFavoriteProduct: IProductType[] = [];
  if (accessToken && results[4]) {
    const resp = results[4];
    if (resp.code === 0 && resp.data) {
      listFavoriteProduct = resp.data.product_types;
    }
  }

  return (
    <HomeComponent
      banners={results[0].data.banners}
      categories={results[0].data.categories}
      products_best_seller={results[1].data.product_types}
      products_most_view={results[2].data.product_types}
      products_highest_rating={results[3].data.product_types}
      listFavoriteProduct={listFavoriteProduct || []}
    />
  );
}
