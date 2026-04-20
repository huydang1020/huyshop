"use client";

import { upsertCartAction } from "@/actions/cart.action";
import { getListReviewsOfProductTypeAction } from "@/actions/order.action";
import defaultAvatar from "@/assets/images/avatar.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/helper";
import { Image as AntdImage, Col, Rate, Row } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { isEmpty } from "lodash";
import {
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface ProductDetailComponentProps {
  slug: string;
  accessToken: string;
}

const ProductDescription = dynamic(() => import("./product-description"), {
  ssr: false,
});

export default function ProductDetailComponent(
  props: ProductDetailComponentProps
) {
  const router = useRouter();
  const { accessToken } = props;
  const [product, setProduct] = useState<any>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>({});
  const [mainImage, setMainImage] = useState<any>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(true);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // State cho reviews và pagination
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  const reviewsPerPage = 10;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customer/product-type/${props.slug}`
        );
        if (!resp.ok) {
          return;
        }
        const data = await resp.json();
        if (data.code === 0) {
          document.title = data.data.name;
          const respReviews = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/customer/reviews?product_type_id=${data.data.id}&limit=10&skip=0`
          );
          if (!respReviews.ok) {
            return;
          }
          const dataReviews = await respReviews.json();
          setReviews(dataReviews.data.reviews);
          setTotalReviews(dataReviews.data.total);
        }
        setProduct(data.data);
        setSelectedProduct(data.data.products?.[0] || {});
        setMainImage(data.data.products?.[0]?.image || "");
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [props.slug]);

  console.log("🚀 ~ reviews:", reviews);

  // Fetch more reviews function
  const fetchMoreReviews = useCallback(async () => {
    try {
      setIsLoadingReviews(true);
      const pageNumber = Math.floor(reviews.length / reviewsPerPage);

      const resp = await getListReviewsOfProductTypeAction(product.id, {
        limit: reviewsPerPage,
        skip: pageNumber,
      });

      if (resp?.data) {
        const newReviews = resp.data.reviews || [];
        const updatedReviews = [...reviews, ...newReviews];
        setReviews(updatedReviews);
        setTotalReviews(resp.data.total || 0);
        setHasMoreReviews(
          newReviews.length > 0 &&
            updatedReviews.length < (resp.data.total || 0)
        );
      }
    } catch (error) {
      console.error("Error fetching more reviews:", error);
      toast.error("Đã có lỗi xảy ra khi tải thêm đánh giá");
    } finally {
      setIsLoadingReviews(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length, product.id, reviewsPerPage]);

  // Initialize hasMore based on initial data
  useEffect(() => {
    const initialReviews = reviews || [];
    const initialTotal = totalReviews || 0;
    setHasMoreReviews(
      initialReviews.length > 0 && initialReviews.length < initialTotal
    );
  }, [reviews, totalReviews]);

  const getAttributesFromProduct = (prod: any): Record<string, string> =>
    Object.fromEntries(Object.entries(prod.attribute_values || {})) as Record<
      string,
      string
    >;

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(getAttributesFromProduct(selectedProduct));

  useEffect(() => {
    setSelectedAttributes(getAttributesFromProduct(selectedProduct));
  }, [selectedProduct]);

  const incrementQuantity = () => {
    setQuantity((prev) => {
      const num = parseInt(prev, 10);
      if (isNaN(num)) return "1";
      if (num >= (selectedProduct?.quantity || 0))
        return String(selectedProduct?.quantity || 0);
      return String(num + 1);
    });
  };

  const decrementQuantity = () => {
    setQuantity((prev) => {
      const num = parseInt(prev, 10);
      if (isNaN(num) || num <= 1) return "1";
      return String(num - 1);
    });
  };

  const handleBuyNow = () => {
    // 1. Chỉ lấy sản phẩm đã chọn với số lượng đã chọn
    const checkoutData: any = {
      stores: [
        {
          id: product?.store?.id,
          name: product?.store?.name,
          logo: product?.store?.logo,
          products: [
            {
              ...selectedProduct,
              quantity: parseInt(quantity, 10),
            },
          ],
        },
      ],
    };

    // 2. Save the data to localStorage
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // 3. Navigate to the checkout page
    router.push("/thanh-toan-don-hang");
  };

  const handleAddToCart = async () => {
    try {
      if (!accessToken) {
        toast.warning("Bạn cần đăng nhập!");
        return;
      }
      const cartItem = {
        product_id: selectedProduct?.id,
        quantity: parseInt(quantity, 10),
      };
      const resp = await upsertCartAction([cartItem]);
      if (resp && resp.code !== 0) {
        toast.error(resp.message);
        return;
      }
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi thêm vào giỏ hàng");
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

  // Spinner component
  const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  );

  const ProductLoading = () => (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-gray-500">Đang tải ...</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <ProductLoading />;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="grid md:grid-cols-2">
        {/* Left side - Product Images */}
        <div className="space-y-4 overflow-hidden md:overflow-visible">
          <div className="w-full flex flex-col items-center select-none">
            <Card className="w-full md:w-auto">
              <CardContent className="flex aspect-square md:aspect-video items-center justify-center p-2 md:p-6">
                <Image
                  src={mainImage}
                  alt={product?.name || "Sản phẩm"}
                  width={450}
                  height={450}
                  className="object-contain w-full h-full md:object-cover md:w-[450px] md:h-[450px]"
                  ref={mainImageRef}
                  unoptimized
                />
              </CardContent>
            </Card>
            <Carousel className="mt-4 w-full md:max-w-sm select-none">
              <CarouselContent className="flex my-1 ml-0">
                {!isEmpty(product) &&
                  product.products &&
                  product.products.length > 0 &&
                  Array.from(
                    new Map(
                      product.products.map((p: IProduct) => [p.image, p])
                    ).values()
                  ).map((product: any, index: number) => (
                    <CarouselItem
                      key={index}
                      className="basis-1/5 cursor-pointer"
                      onClick={() => {
                        setMainImage(product.image);
                      }}
                    >
                      <Image
                        src={product.image}
                        alt={product?.name || "Sản phẩm"}
                        width={58}
                        height={58}
                        unoptimized
                        className={cn(
                          "object-cover",
                          mainImage === product.image
                            ? "ring-2 ring-blue-500"
                            : ""
                        )}
                      />
                    </CarouselItem>
                  ))}
              </CarouselContent>
              {!isEmpty(product) &&
                product.products &&
                product.products.length > 5 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
            </Carousel>
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6 px-2 md:px-0 overflow-hidden md:overflow-visible">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold mt-4 sm:mt-0">
              {selectedProduct?.name || product?.name || "Sản phẩm"}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-sm text-gray-600">
                Lượt xem: {product.views || 0}
              </div>
              <span className="text<<-sm text-gray-600">|</span>
              <div className="flex items-center">
                {renderStars(product.average_rating || 0)}
              </div>
              <span className="text-sm text-gray-600">|</span>
              <span className="text-sm text-green-600">
                Còn {selectedProduct?.quantity || 0} sản phẩm
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(selectedProduct?.sell_price || 0)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {selectedProduct?.origin_price !== selectedProduct?.sell_price &&
                formatCurrency(selectedProduct?.origin_price || 0)}
            </span>
            {(selectedProduct?.origin_price || 0) -
              (selectedProduct?.sell_price || 0) >
              0 && (
              <Badge
                variant="outline"
                className="ml-2 text-red-500 border-red-500"
              >
                Tiết kiệm{" "}
                {formatCurrency(
                  (selectedProduct?.origin_price || 0) -
                    (selectedProduct?.sell_price || 0)
                )}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              {/* Attribute selection cho attribute_values dạng Record<string, string> */}
              {(() => {
                // Lấy tất cả attribute ids từ các sản phẩm con
                const attributeIds: any =
                  !isEmpty(product) &&
                  product.products &&
                  product.products.length > 0 &&
                  Array.from(
                    new Set(
                      product.products.flatMap((p: IProduct) =>
                        Object.keys(p.attribute_values || {})
                      )
                    )
                  );
                // Lấy tất cả giá trị cho từng attribute id
                const attributeOptions =
                  !isEmpty(attributeIds) &&
                  product.products &&
                  attributeIds.map((attrId: any) => ({
                    id: attrId,
                    name: attrId,
                    values: Array.from(
                      new Set(
                        product.products
                          .map((p: any) => p.attribute_values?.[attrId])
                          .filter(Boolean)
                      )
                    ),
                  }));
                // Xử lý chọn thuộc tính
                const handleSelect = (attributeId: string, value: string) => {
                  const newSelectedAttributes = {
                    ...selectedAttributes,
                    [attributeId]: value,
                  };
                  setSelectedAttributes(newSelectedAttributes);
                  // Tìm sản phẩm con phù hợp với lựa chọn mới
                  const matched = product.products?.find((p: IProduct) =>
                    Object.entries(newSelectedAttributes).every(
                      ([attrId, val]) => p.attribute_values?.[attrId] === val
                    )
                  );
                  if (matched) {
                    setSelectedProduct(matched);
                    if (typeof setMainImage === "function")
                      setMainImage(matched.image);
                  }
                };
                return (
                  <div>
                    {!isEmpty(attributeOptions) &&
                      attributeOptions.map((group: any) => (
                        <div key={group.id} className="mb-2">
                          <div className="font-semibold mb-1">{group.name}</div>
                          <div className="flex gap-2">
                            {group.values.map((value: any) => (
                              <Button
                                variant="outline"
                                key={value}
                                className={`px-3 py-1 rounded min-w-[100px] ${
                                  selectedAttributes[group.id] === value
                                    ? "border-blue-600"
                                    : ""
                                }`}
                                onClick={() => handleSelect(group.id, value)}
                                type="button"
                              >
                                {value}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })()}
            </div>
            <div>
              <h3 className="font-medium mb-2">Số lượng</h3>
              <div className="flex items-center select-none">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity === "1"}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div
                  className={cn(
                    "rounded-md p-px transition-colors mx-2",
                    "bg-input",
                    "focus-within:bg-gradient-to-br focus-within:from-blue-600 focus-within:to-purple-600"
                  )}
                >
                  <input
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        const num = parseInt(val, 10);
                        if (isNaN(num) || val === "") {
                          setQuantity(val);
                        } else if (num <= (selectedProduct?.quantity || 0)) {
                          setQuantity(val);
                        }
                      }
                    }}
                    onBlur={() => {
                      if (
                        !quantity ||
                        isNaN(parseInt(quantity)) ||
                        parseInt(quantity) < 1
                      ) {
                        setQuantity("1");
                      } else if (
                        parseInt(quantity) > (selectedProduct?.quantity || 0)
                      ) {
                        setQuantity(String(selectedProduct?.quantity || 0));
                      }
                    }}
                    className="h-[36px] w-16 text-center rounded-[7px] border-0 bg-background shadow-sm focus:outline-none"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={
                    parseInt(quantity) >= (selectedProduct?.quantity || 0)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(selectedProduct?.quantity || 0) === 0 && (
              <span className="text-red-500 font-bold">
                Xin lỗi, sản phẩm này đã hết hàng
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={handleBuyNow}
              disabled={selectedProduct.quantity === 0}
            >
              Mua ngay
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={handleAddToCart}
              disabled={selectedProduct.quantity === 0}
            >
              Thêm vào giỏ hàng
            </Button>
            {/* <Button variant="ghost" size="icon" className="h-12 w-12">
              <Heart className="h-5 w-5" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Đã sao chép link sản phẩm");
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              <span className="text-sm">Giao hàng nhanh, đúng hẹn</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gray-500" />
              <span className="text-sm">Bảo hành 30 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-gray-500" />
              <span className="text-sm">
                Kiểm tra hàng trước khi thanh toán
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <span className="text-sm">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto mt-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile: Stack everything vertically */}
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center justify-between sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16">
                    <Image
                      src={product?.store?.logo}
                      alt="Seller avatar"
                      className="rounded-full object-cover"
                      width={64}
                      height={64}
                      unoptimized
                    />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                      {product?.store?.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-bold">Tham gia:</span>{" "}
                      {dayjs.unix(product?.store?.created_at).fromNow()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5"
                  onClick={() => {
                    router.push(`/cua-hang/${product?.store?.slug}`);
                  }}
                >
                  <Store className="w-4 h-4" />
                  Xem Shop
                </Button>

                {/* Action Buttons - Full width on mobile */}
                {/* <div className="flex gap-2 w-full sm:w-auto">
                  <Button className="flex-1 sm:flex-none px-4 py-2.5">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Ngay
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Xem Shop
                  </Button>
                </div> */}
              </div>

              {/* Statistics Section - Better mobile layout */}
              {/* <div className="border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">Đánh Giá</div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      9.8k
                    </div>
                  </div>

                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">Tỉ Lệ Phản Hồi</div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      100%
                    </div>
                  </div>

                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">Tham Gia</div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      3 năm trước
                    </div>
                  </div>

                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">Sản Phẩm</div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      20
                    </div>
                  </div>

                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">
                      Thời Gian Phản Hồi
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      trong vài giờ
                    </div>
                  </div>

                  <div className="flex justify-between items-center sm:flex-col sm:items-start p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                    <div className="text-sm text-gray-500">Người Theo Dõi</div>
                    <div className="text-lg sm:text-xl font-bold text-red-500">
                      16.3k
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Tabs */}
      <div className="mt-8">
        {/* Mobile: Hiển thị dọc */}
        <div className="block md:hidden space-y-6">
          {/* Mô tả */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-bold text-lg mb-2">Mô tả</h2>
              <ProductDescription html={product?.description || ""} />
            </CardContent>
          </Card>
          {/* Thông số kỹ thuật */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-bold text-lg mb-2">Thông số</h2>
              {!isEmpty(product) &&
                product.product_details &&
                Object.entries(product.product_details).map(
                  ([key, value]: any) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  )
                )}
            </CardContent>
          </Card>
          {/* Đánh giá */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Đánh giá</h2>
                  <span className="text-sm text-gray-500">
                    {totalReviews} đánh giá
                  </span>
                </div>
                <div className="space-y-6">
                  {/* Mẫu đánh giá */}
                  {reviews && reviews.length > 0 ? (
                    <>
                      {reviews.map((review) => (
                        <React.Fragment key={review.id}>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={review.user.avatar || defaultAvatar}
                                  alt={review.user.full_name}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                  unoptimized
                                />
                                <h4 className="font-medium">
                                  {review.user.full_name}
                                </h4>
                              </div>
                              <span className="text-sm text-gray-500">
                                {dayjs
                                  .unix(review.created_at)
                                  .format("DD/MM/YYYY HH:mm:ss")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Rate value={review.rating} disabled />
                            </div>
                            <div className="flex items-center gap-2">
                              <AntdImage.PreviewGroup>
                                <Row gutter={8}>
                                  {review.images &&
                                    review.images.length > 0 &&
                                    review.images.map(
                                      (url: string, index: number) => (
                                        <Col
                                          key={index}
                                          style={{ marginBottom: 10 }}
                                        >
                                          <AntdImage
                                            src={url}
                                            width={100}
                                            height={100}
                                            style={{
                                              objectFit: "cover",
                                              borderRadius: 8,
                                            }}
                                          />
                                        </Col>
                                      )
                                    )}
                                </Row>
                              </AntdImage.PreviewGroup>
                            </div>
                            <p className="text-gray-700">{review.content}</p>
                            {review.seller_reply && (
                              <div className="text-gray-700 bg-gray-100 p-4 rounded-md">
                                <div className="flex flex-col gap-2">
                                  <p className="font-medium">
                                    Phản hồi từ người bán:
                                  </p>
                                  <span className="text-sm text-gray-500">
                                    {dayjs
                                      .unix(review.seller_reply_at)
                                      .format("DD/MM/YYYY HH:mm:ss")}
                                  </span>
                                </div>
                                <p className="mt-2">{review.seller_reply}</p>
                              </div>
                            )}
                          </div>
                          <Separator />
                        </React.Fragment>
                      ))}
                      {hasMoreReviews && (
                        <Button
                          className="w-full"
                          onClick={fetchMoreReviews}
                          disabled={isLoadingReviews}
                        >
                          {isLoadingReviews
                            ? "Đang tải..."
                            : "Xem thêm đánh giá"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có đánh giá nào cho sản phẩm này
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Vận chuyển & Đổi trả */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-bold text-lg mb-2">Vận chuyển & Đổi trả</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Chính sách vận chuyển
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Đối tác vận chuyển uy tín: Giao hàng nhanh, đúng hẹn
                    </li>
                    <li>PĐóng gói cẩn thận, đảm bảo hàng nguyên vẹn</li>
                    <li>Thời gian giao hàng: 2-5 ngày làm việc</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Chính sách đổi trả
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>
                      Đổi trả miễn phí trong vòng 7 ngày nếu lỗi từ nhà sản xuất
                    </li>
                    <li>Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng</li>
                    <li>Không áp dụng đổi trả cho sản phẩm đã giảm giá</li>
                  </ul>
                </div>
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Cam kết chất lượng</AlertTitle>
                  <AlertDescription>
                    Chúng tôi cam kết 100% sản phẩm chính hãng, mới 100%. Hoàn
                    tiền 100% nếu phát hiện hàng giả, hàng nhái.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Desktop: Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specifications">Thông số</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="shipping">Vận chuyển & Đổi trả</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <ProductDescription html={product?.description || ""} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6 space-y-2">
                  {!isEmpty(product) &&
                    product.product_details &&
                    Object.entries(product.product_details).map(
                      ([key, value]: any) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      )
                    )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Đánh giá sản phẩm</h2>
                    <span className="text-sm text-gray-500">
                      {totalReviews} đánh giá
                    </span>
                  </div>
                  <div className="space-y-6">
                    {/* Mẫu đánh giá */}
                    {reviews && reviews.length > 0 ? (
                      <>
                        {reviews.map((review) => (
                          <React.Fragment key={review.id}>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={review.user.avatar || defaultAvatar}
                                    alt={review.user.full_name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                  <h4 className="font-medium">
                                    {review.user.full_name}
                                  </h4>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {dayjs
                                    .unix(review.created_at)
                                    .format("DD/MM/YYYY HH:mm:ss")}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Rate value={review.rating} disabled />
                              </div>
                              <div className="flex items-center gap-2">
                                <AntdImage.PreviewGroup>
                                  <Row gutter={8}>
                                    {review.images &&
                                      review.images.length > 0 &&
                                      review.images.map(
                                        (url: string, index: number) => (
                                          <Col
                                            key={index}
                                            style={{ marginBottom: 10 }}
                                          >
                                            <AntdImage
                                              src={url}
                                              width={100}
                                              height={100}
                                              style={{
                                                objectFit: "cover",
                                                borderRadius: 8,
                                              }}
                                            />
                                          </Col>
                                        )
                                      )}
                                  </Row>
                                </AntdImage.PreviewGroup>
                              </div>
                              <p className="text-gray-700">{review.content}</p>
                              {review.seller_reply && (
                                <div className="text-gray-700 bg-gray-100 p-4 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">
                                      Phản hồi từ người bán:
                                    </p>
                                    <span className="text-sm text-gray-500">
                                      {dayjs
                                        .unix(review.seller_reply_at)
                                        .format("DD/MM/YYYY HH:mm:ss")}
                                    </span>
                                  </div>
                                  <p>{review.seller_reply}</p>
                                </div>
                              )}
                            </div>
                            <Separator />
                          </React.Fragment>
                        ))}
                        {hasMoreReviews && (
                          <Button
                            className="w-full"
                            onClick={fetchMoreReviews}
                            disabled={isLoadingReviews}
                          >
                            {isLoadingReviews
                              ? "Đang tải..."
                              : "Xem thêm đánh giá"}
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có đánh giá nào cho sản phẩm này
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Chính sách vận chuyển
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>
                          Đối tác vận chuyển uy tín: Giao hàng nhanh, đúng hẹn
                        </li>
                        <li>Đóng gói cẩn thận, đảm bảo hàng nguyên vẹn</li>
                        <li>Kiểm tra hàng trước khi thanh toán</li>
                        <li>Thời gian giao hàng: 2-5 ngày làm việc</li>
                      </ul>
                    </div>
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>Cam kết chất lượng</AlertTitle>
                      <AlertDescription>
                        Chúng tôi cam kết 100% sản phẩm chính hãng, mới 100%.
                        Hoàn tiền 100% nếu phát hiện hàng giả, hàng nhái.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {/* <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.relatedProducts.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2">{item.name}</h3>
                <p className="text-primary font-bold mt-2">
                  {formatCurrency(item.price)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}
    </div>
  );
}
