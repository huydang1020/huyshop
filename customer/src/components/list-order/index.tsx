"use client";

import { Package, Star, XCircle } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import {
  cancelOrderAction,
  getListOrderOfCustomerAction,
  getListReviewsOfCustomerAction,
  rateProductAction,
} from "@/actions/order.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/helper";
import { Form, FormProps, Input, Rate, Tag } from "antd";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import UploadImage from "../upload";

const statusConfig = {
  pending: {
    label: "Chờ xử lý",
    color: "gold",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "blue",
  },
  shipping: {
    label: "Đang vận chuyển",
    color: "purple",
  },
  completed: {
    label: "Đã giao",
    color: "green",
  },
  cancelled: {
    label: "Đã hủy",
    color: "red",
  },
};

interface ListOrderProps {
  data: IOrderResponse;
  reviews: IReviewResponse;
}

// Note: Inlined CancelOrderDialog to avoid component separation issues

// Note: Inlined OrderHistorySteps to avoid component separation issues

// Note: Inlined OrderDetailSheet to avoid state management issues

export default function ListOrder(props: ListOrderProps) {
  const [orders, setOrders] = useState<IOrder[]>(props.data?.orders || []);
  const [totalOrders, setTotalOrders] = useState<number>(props.data?.total);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("all");
  const [openRateProducts, setOpenRateProducts] = useState<
    Record<string, boolean>
  >({});
  const [reviews, setReviews] = useState<IReview[]>(
    props.reviews?.reviews || []
  );
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const itemsPerPage = 10;

  // Fetch reviews function
  const fetchReviews = useCallback(async () => {
    try {
      const resp = await getListReviewsOfCustomerAction({
        limit: 100, // Lấy nhiều reviews để đảm bảo có đủ data
        skip: 0,
      });
      if (resp?.data) {
        setReviews(resp.data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, []);

  // Open order detail sheet
  const openOrderDetail = useCallback((order: IOrder) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  }, []);

  // Close order detail sheet
  const closeOrderDetail = useCallback(() => {
    setSelectedOrder(null);
    setIsSheetOpen(false);
    setOpenRateProducts({}); // Reset any open rating forms
  }, []);

  // Toggle đánh giá cho từng sản phẩm - chỉ cho phép 1 sản phẩm đánh giá tại một thời điểm
  const toggleRateProduct = useCallback((productId: string) => {
    setOpenRateProducts((prev) => {
      const isCurrentlyOpen = prev[productId];

      // Nếu sản phẩm hiện tại đang mở, thì đóng nó lại
      if (isCurrentlyOpen) {
        return {};
      }

      // Nếu sản phẩm hiện tại đang đóng, thì đóng tất cả các sản phẩm khác và chỉ mở sản phẩm này
      return {
        [productId]: true,
      };
    });
  }, []);

  const fetchOrders = useCallback(
    async (status?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        }

        // skip theo kiểu pagination: skip 0 = trang 1, skip 1 = trang 2
        const pageNumber = isLoadMore
          ? Math.floor(orders.length / itemsPerPage)
          : 0;

        const resp = await getListOrderOfCustomerAction({
          limit: itemsPerPage,
          skip: pageNumber,
          state: status === "all" ? undefined : status,
        });

        if (resp?.data) {
          if (isLoadMore) {
            // Append new orders to existing ones
            const newOrders = Array.isArray(resp.data.orders)
              ? resp.data.orders
              : [];
            const updatedOrders = [...orders, ...newOrders];
            setOrders(updatedOrders);
            setHasMore(
              newOrders.length > 0 &&
                updatedOrders.length < (resp.data.total || 0)
            );
          } else {
            // Replace orders (for status change)
            const newOrders = Array.isArray(resp.data.orders)
              ? resp.data.orders
              : [];
            const total = resp.data.total || 0;
            setOrders(newOrders);
            setTotalOrders(total);
            // Chỉ hiển thị hasMore khi có orders và chưa load hết
            setHasMore(newOrders.length > 0 && newOrders.length < total);
          }
        } else {
          if (!isLoadMore) {
            setOrders([]);
            setTotalOrders(0);
            setHasMore(false);
          }
        }

        if (isLoadMore) {
          setIsLoadingMore(false);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau");
        if (!isLoadMore) {
          setOrders([]);
          setTotalOrders(0);
          setHasMore(false);
        }
        if (isLoadMore) {
          setIsLoadingMore(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders.length, itemsPerPage]
  );

  // Handle status change
  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
    fetchOrders(status);
  };

  const handleLoadMore = () => {
    fetchOrders(currentStatus, true);
  };

  // Initialize hasMore based on initial data
  useEffect(() => {
    const initialOrders = Array.isArray(props.data?.orders)
      ? props.data.orders
      : [];
    const initialTotal = props.data?.total || 0;
    setHasMore(initialOrders.length > 0 && initialOrders.length < initialTotal);
  }, [props.data]);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Note: Temporarily disabled scroll locking to test if it's causing the jump issue

  const handleCancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      try {
        const resp = await cancelOrderAction(orderId, {
          cancel_reason: reason,
        });
        console.log("🚀 ~ handleCancelOrder ~ resp:", resp);
        if (resp?.data) {
          const newOrders = Array.isArray(resp.data.orders)
            ? resp.data.orders
            : [];
          const total = resp.data.total || 0;
          setOrders(newOrders);
          setTotalOrders(total);
          setHasMore(newOrders.length > 0 && newOrders.length < total);
        }
        toast.success("Hủy đơn hàng thành công");
        // Refresh lại dữ liệu theo trạng thái hiện tại
        fetchOrders(currentStatus);
      } catch (error) {
        toast.error("Hủy đơn hàng thất bại");
        console.error("Error canceling order:", error);
      }
    },
    [fetchOrders, currentStatus]
  );

  const onFinish: FormProps<any>["onFinish"] = async (values) => {
    console.log("Success:", values);
    const images: string[] = [];
    if (values.images) {
      for (const image of values.images) {
        images.push(image?.response[0]?.url);
      }
    }
    console.log("🚀 ~ onFinish ~ images:", images);

    try {
      const resp = await rateProductAction({
        ...values,
        images,
      });
      if (resp && resp.code !== 0) {
        toast.error("Đánh giá thất bại");
        return;
      }
      toast.success("Đánh giá thành công");
      fetchOrders(currentStatus);
      fetchReviews(); // Gọi lại API reviews để cập nhật danh sách
      toggleRateProduct(values.product_id); // Close the rating form
    } catch (error) {
      console.error("Error rating product:", error);
      toast.error("Đánh giá thất bại");
    }
  };

  const onFinishFailed: FormProps<any>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Note: Inlined OrderCard to avoid component separation issues

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Danh sách đơn hàng</h2>
        <div className="flex items-center gap-4">
          <div className="min-w-[200px]">
            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger className="focus:ring-0">
                <SelectValue placeholder="Chọn trạng thái đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn hàng</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang vận chuyển</SelectItem>
                <SelectItem value="completed">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="text-sm">
            Tổng: {totalOrders || 0} đơn hàng
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.length > 0 ? (
          <>
            {orders.map((order: IOrder, index: number) => (
              <Card key={order.id} className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {index + 1}. Mã đơn hàng: {order.order_code}
                      </CardTitle>
                      <Tag
                        color={
                          statusConfig[order.state as keyof typeof statusConfig]
                            .color
                        }
                      >
                        {
                          statusConfig[order.state as keyof typeof statusConfig]
                            .label
                        }
                      </Tag>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dayjs.unix(order.time_order).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Products Summary */}
                  <div className="space-y-3">
                    {order.product_ordered.slice(0, 2).map((product) => (
                      <div
                        key={product.product_id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex gap-3 items-center">
                          <Image
                            src={product.product.image || "/placeholder.svg"}
                            alt={product.product.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {product.product.name}
                            </h4>
                            <div className="text-xs text-muted-foreground">
                              Số lượng: {product.quantity} ×{" "}
                              {formatCurrency(product.product.sell_price)}
                            </div>
                          </div>
                        </div>
                        {reviews.find(
                          (review) =>
                            review.product_id === product.product_id &&
                            review.order_id === order.id
                        ) && <Tag color="green">Đã đánh giá</Tag>}
                      </div>
                    ))}
                    {order.product_ordered.length > 2 && (
                      <div className="text-sm text-muted-foreground">
                        Và {order.product_ordered.length - 2} sản phẩm khác...
                      </div>
                    )}
                  </div>

                  {/* Summary and Action */}
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm">
                      <span className="font-medium">Tổng tiền: </span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(order.total_money)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDetail(order)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-24 py-6"
                >
                  {isLoadingMore ? "Đang tải..." : "Xem thêm đơn hàng"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Order Detail Sheet - Inlined to prevent state issues */}
      {selectedOrder && (
        <Sheet open={isSheetOpen} onOpenChange={closeOrderDetail}>
          <SheetContent
            className="w-[90%] sm:w-[65%] lg:w-[50%] xl:w-[45%] sm:max-w-none lg:max-w-none xl:max-w-none overflow-y-scroll"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>
                Chi tiết đơn hàng #{selectedOrder.order_code}
              </SheetTitle>
              <SheetDescription>
                Đặt hàng:{" "}
                {dayjs
                  .unix(selectedOrder.time_order)
                  .format("DD/MM/YYYY HH:mm:ss")}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Order Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Trạng thái:</span>
                <Tag
                  color={
                    statusConfig[
                      selectedOrder.state as keyof typeof statusConfig
                    ].color
                  }
                >
                  {
                    statusConfig[
                      selectedOrder.state as keyof typeof statusConfig
                    ].label
                  }
                </Tag>
              </div>

              {/* Order History Steps - Inlined */}
              {selectedOrder.history && (
                <div>
                  <h4 className="font-medium text-sm mb-3">Lịch sử đơn hàng</h4>
                  {(() => {
                    const parseHistory = (historyString: string) => {
                      try {
                        const historyData = JSON.parse(historyString);
                        return Object.entries(historyData)
                          .map(([status, timestamp]) => ({
                            status,
                            timestamp: Number(timestamp),
                            date: new Date(Number(timestamp) * 1000),
                          }))
                          .sort((a, b) => a.timestamp - b.timestamp);
                      } catch (error) {
                        console.error("Error parsing history:", error);
                        return [];
                      }
                    };

                    const getStatusLabel = (status: string) => {
                      const labels: Record<string, string> = {
                        pending: "Chờ xử lý",
                        confirmed: "Đã xác nhận",
                        shipping: "Đang vận chuyển",
                        completed: "Đã giao",
                        cancelled: "Đã hủy",
                      };
                      return labels[status] || status;
                    };

                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "pending":
                          return (
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          );
                        case "confirmed":
                          return (
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          );
                        case "shipping":
                          return (
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          );
                        case "completed":
                          return (
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          );
                        case "cancelled":
                          return (
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                          );
                        default:
                          return (
                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                          );
                      }
                    };

                    const historySteps = parseHistory(selectedOrder.history);

                    if (historySteps.length === 0) {
                      return null;
                    }

                    return (
                      <>
                        {/* Desktop - Horizontal Layout */}
                        <div className="hidden md:block">
                          <div className="flex items-center justify-between relative">
                            {historySteps.map((step, index) => (
                              <div
                                key={step.status}
                                className="flex flex-col items-center relative flex-1"
                              >
                                {/* Connecting Line */}
                                {index < historySteps.length - 1 && (
                                  <div
                                    className="absolute top-1.5 left-1/2 w-full h-px bg-gray-200 z-0"
                                    style={{ transform: "translateX(50%)" }}
                                  />
                                )}

                                {/* Icon */}
                                <div className="relative z-10 bg-white p-1">
                                  {getStatusIcon(step.status)}
                                </div>

                                {/* Content */}
                                <div className="mt-3 text-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    {getStatusLabel(step.status)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {dayjs(step.date).format("DD/MM/YYYY")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {dayjs(step.date).format("HH:mm:ss")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mobile - Vertical Layout */}
                        <div className="md:hidden">
                          <div className="relative">
                            {historySteps.map((step, index) => (
                              <div
                                key={step.status}
                                className="flex items-start space-x-3 pb-4"
                              >
                                {/* Icon */}
                                <div className="flex flex-col items-center">
                                  {getStatusIcon(step.status)}
                                  {index < historySteps.length - 1 && (
                                    <div className="w-px h-8 bg-gray-200 mt-2" />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {getStatusLabel(step.status)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {dayjs(step.date).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Products */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Sản phẩm đã đặt</h3>
                {selectedOrder.product_ordered.map((product, index) => (
                  <div key={product.product_id}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={product.product.image || "/placeholder.svg"}
                          alt={product.product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm truncate">
                              {product.product.name}
                            </h4>
                            {(() => {
                              const attributeString = product.product
                                ?.attribute_values
                                ? Object.entries(
                                    product.product.attribute_values
                                  )
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(" | ")
                                : "";
                              return (
                                attributeString && (
                                  <p className="mt-1 text-xs text-muted-foreground break-words">
                                    {attributeString}
                                  </p>
                                )
                              );
                            })()}
                            <div className="flex flex-col gap-2 mt-2">
                              <div className="text-sm text-muted-foreground">
                                Số lượng: {product.quantity} ×{" "}
                                {formatCurrency(product.product.sell_price)}
                              </div>
                            </div>
                          </div>

                          {selectedOrder.state === "completed" && (
                            <div>
                              {reviews.find(
                                (review) =>
                                  review.product_id === product.product_id &&
                                  review.order_id === selectedOrder.id
                              ) ? (
                                <Tag color="green">Đã đánh giá</Tag>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs w-fit"
                                  onClick={() =>
                                    toggleRateProduct(product.product_id)
                                  }
                                >
                                  <Star className="w-3 h-3" />
                                  Đánh giá ngay
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Rating Form */}
                        <Collapsible
                          open={openRateProducts[product.product_id] || false}
                        >
                          <CollapsibleContent className="mt-4">
                            <Separator />
                            <div className="mt-4">
                              <Form
                                layout="vertical"
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                                initialValues={{
                                  order_id: selectedOrder.id,
                                  product_id: product.product_id,
                                }}
                              >
                                <Form.Item name="order_id" hidden>
                                  <Input />
                                </Form.Item>
                                <Form.Item name="product_id" hidden>
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  label="Đánh giá"
                                  name="rating"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng đánh giá",
                                    },
                                  ]}
                                >
                                  <Rate />
                                </Form.Item>
                                <Form.Item
                                  label="Hình ảnh đính kèm (tối đa 5 hình ảnh)"
                                  name="images"
                                >
                                  <UploadImage multiple={true} />
                                </Form.Item>
                                <Form.Item
                                  label="Đánh giá của bạn"
                                  name="content"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập đánh giá",
                                    },
                                  ]}
                                >
                                  <Textarea placeholder="Nhập đánh giá" />
                                </Form.Item>
                                <Form.Item>
                                  <Button type="submit">Gửi đánh giá</Button>
                                </Form.Item>
                              </Form>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                    {index < selectedOrder.product_ordered.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tổng tiền:</span>
                  <span className="text-red-600">
                    {formatCurrency(selectedOrder.total_money)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.state === "pending" && (
                <div className="pt-4 border-t">
                  {/* Inline Cancel Order Dialog */}
                  <Dialog
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Hủy đơn hàng
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="sm:max-w-[425px]"
                      onInteractOutside={(e) => e.preventDefault()}
                      onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                        <DialogDescription>
                          Sau khi hủy đơn hàng, bạn sẽ không thể hoàn tác. Vui
                          lòng nhập lý do hủy đơn hàng.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Nhập lý do hủy đơn hàng"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCancelDialogOpen(false);
                            setCancelReason("");
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={() => {
                            if (!cancelReason.trim()) {
                              toast.error("Vui lòng nhập lý do hủy đơn hàng");
                              return;
                            }
                            handleCancelOrder(selectedOrder.id, cancelReason);
                            setCancelDialogOpen(false);
                            setCancelReason("");
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Xác nhận
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
