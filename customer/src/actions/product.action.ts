"use server";

import productService from "@/services/product.service";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getListProductTypeAction(query?: IQueryProductType) {
  const resp = await productService.listProductType(query);
  return resp;
}

export async function getProductTypeAction(slug: string) {
  const resp = await productService.getProductType(slug);
  return resp;
}

export async function createFavoriteProductAction(productId: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await productService.createFavoriteProduct(
    productId,
    accessToken
  );
  if (resp && resp.code === 0) {
    revalidateTag("product-type");
    revalidateTag("favorite-product");
    revalidateTag("user-info");
  }
  return resp;
}

export async function getListFavoriteProductAction(query?: IQueryProductType) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await productService.getListFavoriteProduct(accessToken, query);
  return resp;
}

export async function deleteOneFavoriteProductAction(productId: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await productService.deleteOneFavoriteProduct(
    productId,
    accessToken
  );
  if (resp && resp.code === 0) {
    revalidateTag("favorite-product");
    revalidateTag("user-info");
  }
  return resp;
}

export async function deleteAllFavoriteProductAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await productService.deleteAllFavoriteProduct(accessToken);
  if (resp && resp.code === 0) {
    revalidateTag("user-info");
    revalidateTag("favorite-product");
  }
  return resp;
}
