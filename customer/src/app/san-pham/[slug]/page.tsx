import ProductDetailComponent from "@/components/product-detail";
import { cookies } from "next/headers";

export default async function ProductDetail({
  params,
}: {
  params: { slug: string };
}) {
  const accessToken = cookies().get("access_token")?.value;
  return (
    <ProductDetailComponent
      slug={params.slug}
      accessToken={accessToken || ""}
    />
  );
}
