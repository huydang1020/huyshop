"use client";

import { buyVoucherAction } from "@/actions/voucher.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber } from "@/utils/helper";
import dayjs from "dayjs";
import {
  Calendar,
  Clock,
  Gift,
  MapPin,
  Percent,
  Share2,
  Star,
  Tag,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

interface IVoucherDetailProps {
  voucher: IVoucher;
  userVouchersFree: IUserVoucher[];
  accessToken: string;
}

const VoucherDescription = dynamic(() => import("./voucher-description"), {
  ssr: false,
});

export default function VoucherDetail(props: IVoucherDetailProps) {
  const { voucher, accessToken, userVouchersFree } = props;

  const handleBuyVoucher = async (voucher_id: string) => {
    if (!accessToken) {
      toast.warning("Vui lòng đăng nhập để đổi ưu đãi");
      return;
    }
    const resp = await buyVoucherAction(voucher_id);
    if (resp && resp.code !== 0) {
      toast.error(resp.message);
      return;
    }
    toast.success("Đổi ưu đãi thành công");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/uu-dai">Ưu đãi</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{voucher.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 px-4 py-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voucher Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={voucher.image}
                    alt={voucher.name}
                    width={300}
                    height={200}
                    unoptimized
                    className="rounded-lg object-cover w-full md:w-80 h-48"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold">{voucher.name}</h2>

                  {/* Show description on mobile only */}
                  <div className="lg:hidden">
                    <VoucherDescription html={voucher.description} />
                  </div>

                  {/* Discount Info */}
                  <div className="flex items-center gap-4 text-lg">
                    {voucher.discount_percent > 0 ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Percent className="h-5 w-5" />
                        Giảm {voucher.discount_percent}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Tag className="h-5 w-5" />
                        Giảm {formatCurrency(voucher.discount_cash)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Chi tiết ưu đãi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Giảm giá tối đa
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(
                      voucher.max_discount_cash_value
                        ? voucher.max_discount_cash_value
                        : voucher.discount_cash
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Giá trị đơn hàng tối thiểu
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(voucher.min_total_bill_value || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Điểm đổi</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {formatNumber(voucher.point_exchange || 0)} điểm
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Loại ưu đãi</p>
                  <p className="font-semibold">
                    {voucher.type === "point" ? "Đổi điểm" : "Miễn phí"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tình trạng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Đã lấy:{" "}
                    {voucher.total_quantity - (voucher.remaining_quantity || 0)}
                  </span>
                  <span>Còn lại: {voucher.remaining_quantity || 0}</span>
                </div>
                <Progress
                  value={
                    ((voucher.total_quantity -
                      (voucher.remaining_quantity || 0)) /
                      voucher.total_quantity) *
                    100
                  }
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {voucher.remaining_quantity || 0} /{" "}
                  {voucher.total_quantity || 0} ưu đãi còn lại
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian áp dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {dayjs.unix(voucher.start_at).format("DD/MM/YYYY HH:mm:ss")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {dayjs.unix(voucher.end_at).format("DD/MM/YYYY HH:mm:ss")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information - Move to left column on desktop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Đối tác phát hành
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tên đối tác</p>
                <p className="font-medium">{voucher.partner.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">
                  Cửa hàng áp dụng
                </p>
                <p className="font-medium">
                  {!voucher.store_ids
                    ? "Tất cả cửa hàng"
                    : voucher.stores.map((store) => store.name).join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Card - Move to left column */}
          <Card>
            <CardHeader>
              <CardTitle>Đổi ưu đãi</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {voucher.point_exchange || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  điểm cần thiết
                </div>
              </div>
              {userVouchersFree.length > 0 &&
              userVouchersFree.some((uv) => uv.voucher_id === voucher.id) ? (
                <Button className="w-full" size="lg" disabled={true}>
                  <Gift className="h-4 w-4" />
                  Bạn đã đổi ưu đãi này
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={voucher.remaining_quantity === 0}
                  onClick={() => handleBuyVoucher(voucher.id)}
                >
                  <Gift className="h-4 w-4" />
                  Đổi ngay
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Đã sao chép link ưu đãi");
                }}
              >
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Only description */}
        <div className="space-y-4">
          {/* Description Card - Only show on desktop */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <VoucherDescription html={voucher.description} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
