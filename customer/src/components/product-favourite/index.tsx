"use client";

import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/helper";

import {
  createFavoriteProductAction,
  deleteOneFavoriteProductAction,
  getListFavoriteProductAction,
} from "@/actions/product.action";
import { isEmpty } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface IProductFavouriteProps {
  listFavoriteProduct: IProductType[];
  total: number;
}

export default function ProductFavourite(props: IProductFavouriteProps) {
  const { listFavoriteProduct, total } = props;
  const router = useRouter();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [currentProducts, setCurrentProducts] = useState<IProductType[]>([]);
  const itemsPerPage = 12;

  const fetchMoreFavoriteProducts = useCallback(async () => {
    setIsLoadingMore(true);

    // skip theo kiểu pagination: skip 0 = trang 1, skip 1 = trang 2
    const pageNumber = Math.floor(currentProducts.length / itemsPerPage);

    const resp = await getListFavoriteProductAction({
      limit: itemsPerPage,
      skip: pageNumber,
    });

    if (resp && resp.code === 0 && resp.data && resp.data.product_types) {
      const newProducts = Array.isArray(resp.data.product_types)
        ? resp.data.product_types
        : [];
      const updatedProducts = [...currentProducts, ...newProducts];
      setCurrentProducts(updatedProducts);

      // Chỉ ẩn load more khi:
      // 1. Không có sản phẩm mới nào được trả về (API hết data)
      // 2. HOẶC tổng số sản phẩm đã load >= total
      setHasMore(newProducts.length > 0 && updatedProducts.length < total);
    } else {
      // Nếu API lỗi hoặc không trả về data, ẩn load more
      setHasMore(false);
    }

    setIsLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProducts.length, total, itemsPerPage]);

  const handleLoadMore = () => {
    fetchMoreFavoriteProducts();
  };

  useEffect(() => {
    setCurrentProducts(listFavoriteProduct);
    setFavouriteIds(listFavoriteProduct.map((item) => item.id));

    // Hiển thị load more nếu có sản phẩm và chưa load hết
    setHasMore(
      listFavoriteProduct.length > 0 && listFavoriteProduct.length < total
    );
  }, [listFavoriteProduct, total, itemsPerPage]);

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
        const newFavouriteIds = favouriteIds.filter((id) => id !== productId);
        const newCurrentProducts = currentProducts.filter(
          (product) => product.id !== productId
        );

        setFavouriteIds(newFavouriteIds);
        setCurrentProducts(newCurrentProducts);

        // Chỉ ẩn hasMore khi không còn sản phẩm nào, tránh nháy giao diện
        if (newCurrentProducts.length === 0) {
          setHasMore(false);
        }

        toast.success("Xóa sản phẩm yêu thích thành công");
      }
    } else {
      const resp = await createFavoriteProductAction(productId);
      if (resp && resp.code === 0) {
        setFavouriteIds([...favouriteIds, productId]);
        toast.success("Thêm sản phẩm yêu thích thành công");
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sản phẩm yêu thích của bạn
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đây là danh sách sản phẩm mà bạn đã yêu thích. Bạn có thể xem lại
              danh sách sản phẩm yêu thích của mình tại đây.
            </p>
          </div>
        </div>
      </div>
      {isEmpty(currentProducts) ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-2 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Bạn chưa có sản phẩm yêu thích nào
          </h3>
          <Button className="mt-4" onClick={() => router.push("/san-pham")}>
            Xem sản phẩm
          </Button>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {currentProducts.map((productType) => (
              <Card
                key={productType.id}
                className="group transition-shadow duration-200 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link href={`/san-pham/${productType.slug}`}>
                      <Image
                        src={
                          productType.products[0].image || "/placeholder.svg"
                        }
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
                    {productType.products[0].origin_price >
                      productType.products[0].sell_price && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        -
                        {Math.round(
                          ((productType.products[0].origin_price -
                            productType.products[0].sell_price) /
                            productType.products[0].origin_price) *
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
                        {productType.products[0].origin_price >
                        productType.products[0].sell_price ? (
                          <span className="text-xs text-gray-500 line-through">
                            {formatCurrency(
                              productType.products[0].origin_price
                            )}
                          </span>
                        ) : (
                          <span className="text-xs h-4 sm:hidden"></span>
                        )}
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(productType.products[0].sell_price)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm text-gray-600">
                        <span className="text-xs">
                          Đã bán{" "}
                          {formatSoldCount(productType.quantity_sold || 0)}
                        </span>
                        <div className="flex items-center gap-1">
                          {renderStars(productType.average_rating || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-24 py-6"
              >
                {isLoadingMore ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
