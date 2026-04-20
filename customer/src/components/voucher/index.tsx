"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Clock, Eye, Gift, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ListVoucherProps {
  listVoucher: IVoucherResponse;
}

export default function ListVoucher(props: ListVoucherProps) {
  const router = useRouter();
  const { listVoucher } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Ưu Đãi Đặc Biệt
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Khám phá những ưu đãi hấp dẫn và tiết kiệm chi phí mua sắm của bạn
            ngay hôm nay!
          </p>
        </div>

        {isEmpty(listVoucher) ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2 text-center">
            <h3 className="text-lg font-medium mb-2">Chưa có ưu đãi nào</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listVoucher.vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-4 items-center">
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
                        <div className="">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center md:text-left">
                            {voucher.name}
                          </CardTitle>
                          <div className="flex justify-center">
                            <Badge variant="secondary" className="mb-2">
                              <Tag className="w-3 h-3 mr-1" />
                              {voucher.type === "point"
                                ? "Đổi điểm"
                                : "Miễn phí"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="w-4 h-4" />
                      <span>
                        Số lượng còn lại: {voucher.remaining_quantity || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        Hạn sử dụng:{" "}
                        {dayjs
                          .unix(voucher.end_at)
                          .format("DD/MM/YYYY HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/uu-dai/${voucher.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
