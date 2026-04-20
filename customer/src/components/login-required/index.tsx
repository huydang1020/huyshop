"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";

interface ILoginRequiredPageProps {
  page_redirect?: string;
}

const LoginRequiredPage = (props: ILoginRequiredPageProps) => {
  const { page_redirect } = props;

  const router = useRouter();
  const handleLoginRedirect = () => {
    router.push(`/dang-nhap?redirect=${page_redirect || ""}`);
    return;
  };

  return (
    <div className="container mx-auto">
      <Card className="bg-gray-100">
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white">
              <div className="rounded-lg shadow-lg border border-slate-200 p-8 text-center">
                {/* Icon khóa */}
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                {/* Tiêu đề */}
                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                  Yêu cầu đăng nhập
                </h1>

                {/* Thông báo */}
                <Alert className="mb-6 border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800 font-medium">
                    Bạn cần đăng nhập để truy cập nội dung này
                  </AlertDescription>
                </Alert>

                <p className="text-slate-600 mb-8">
                  Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ của chúng tôi
                </p>

                {/* Nút đăng nhập */}
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium text-lg"
                >
                  Đi đến trang đăng nhập
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginRequiredPage;
