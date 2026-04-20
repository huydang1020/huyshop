"use client";

import {
  createFavoriteProductAction,
  deleteOneFavoriteProductAction,
} from "@/actions/product.action";
import { formatCurrency } from "@/utils/helper";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { isEmpty } from "lodash";

interface IProductGridProps {
  productTypes: IProductType[];
  listFavoriteProduct: IProductType[];
}

export default function ProductGrid(props: IProductGridProps) {
  const { productTypes, listFavoriteProduct } = props;
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavouriteIds(
      !isEmpty(listFavoriteProduct) && listFavoriteProduct.length > 0
        ? listFavoriteProduct.map((item) => item.id)
        : []
    );
  }, [listFavoriteProduct]);

  const formatSoldCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleFavoriteProduct = async (productId: string) => {
    if (!productId) return;
    if (favouriteIds.includes(productId)) {
      const resp = await deleteOneFavoriteProductAction(productId);
      if (resp && resp.code === 0) {
        setFavouriteIds(favouriteIds.filter((id) => id !== productId));
      }
      toast.success("Xóa sản phẩm yêu thích thành công");
    } else {
      const resp = await createFavoriteProductAction(productId);
      if (resp && resp.code === 0) {
        setFavouriteIds([...favouriteIds, productId]);
      }
      toast.success("Thêm sản phẩm yêu thích thành công");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  // Check if productTypes is valid array
  if (
    !productTypes ||
    !Array.isArray(productTypes) ||
    productTypes.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-8v2m0 6v2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-500 max-w-md">
          Hiện tại không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn.
          Hãy thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {productTypes.map((productType) => {
        // Safety check for products array
        const firstProduct = productType.products?.[0];
        if (!firstProduct) {
          return null; // Skip this product if no products available
        }

        return (
          <Card
            key={productType.id}
            className="group transition-shadow duration-200 hover:shadow-lg"
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <Link href={`/san-pham/${productType.slug}`}>
                  <Image
                    src={firstProduct.image || "/placeholder.svg"}
                    alt={productType.name}
                    width={300}
                    height={300}
                    unoptimized
                    className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute top-2 right-2 p-2 rounded-full ${
                    favouriteIds.includes(productType.id)
                      ? "text-red-500 bg-white/90"
                      : "text-gray-600 bg-white/90 hover:text-red-500"
                  }`}
                  onClick={() => handleFavoriteProduct(productType.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favouriteIds.includes(productType.id)
                        ? "fill-current"
                        : ""
                    }`}
                  />
                </Button>
                {firstProduct.origin_price > firstProduct.sell_price && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    -
                    {Math.round(
                      ((firstProduct.origin_price - firstProduct.sell_price) /
                        firstProduct.origin_price) *
                        100
                    )}
                    %
                  </Badge>
                )}
              </div>

              <div className="p-4">
                <Link href={`/san-pham/${productType.slug}`}>
                  <h3 className="font-medium text-sm leading-5 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {productType.name}
                  </h3>
                </Link>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    {firstProduct.origin_price > firstProduct.sell_price ? (
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(firstProduct.origin_price)}
                      </span>
                    ) : (
                      <span className="text-xs h-4 sm:hidden"></span>
                    )}
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(firstProduct.sell_price)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm text-gray-600">
                    <span className="text-xs">
                      Đã bán {formatSoldCount(productType.quantity_sold || 0)}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(productType.average_rating || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
