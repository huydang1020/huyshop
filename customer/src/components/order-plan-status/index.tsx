"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";

const getStatusInfo = (code: string) => {
  switch (code) {
    case "00":
      return {
        status: "success",
        title: "Đơn hàng thành công",
        message: "Đơn hàng của bạn đã được xử lý thành công.",
        icon: CheckCircle,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
        titleColor: "text-green-800",
      };
    case "24":
      return {
        status: "cancelled",
        title: "Đơn hàng đã bị hủy",
        message: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
        icon: XCircle,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        titleColor: "text-red-800",
      };
    case "99":
      return {
        status: "error",
        title: "Đã có lỗi xảy ra",
        message:
          "Có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng liên hệ bộ phận hỗ trợ để được giúp đỡ",
        icon: AlertTriangle,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-600",
        titleColor: "text-yellow-800",
      };
    default:
      return {
        status: "error",
        title: "Đã có lỗi xảy ra",
        message:
          "Có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng liên hệ bộ phận hỗ trợ để được giúp đỡ",
        icon: AlertTriangle,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-600",
        titleColor: "text-yellow-800",
      };
  }
};

interface OrderPlanStatusProps {
  code: string;
}

export default function OrderPlanStatus({ code }: OrderPlanStatusProps) {
  const router = useRouter();
  const statusInfo = getStatusInfo(code || "");
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="bg-gray-100">
      <CardContent>
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Trạng thái đơn hàng gói dịch vụ
              </h1>
            </div>

            {/* Status Card */}
            <div
              className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-8 mb-6`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${statusInfo.iconColor} mb-4`}>
                  <StatusIcon size={64} />
                </div>
                <h2
                  className={`text-2xl font-bold ${statusInfo.titleColor} mb-2`}
                >
                  {statusInfo.title}
                </h2>
                <p className="text-gray-700 max-w-md">{statusInfo.message}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                onClick={() => router.push("/")}
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
