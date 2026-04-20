"use client";

import React, { useEffect, useState } from "react";

import { createOrderPlanAction } from "@/actions/plan.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/helper";
import {
  Building,
  Check,
  CheckCircle,
  FileText,
  Handshake,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { toast } from "sonner";

interface ISellerRegistrationProps {
  plans: IPlan[];
  userInfo: IUser;
}

interface ISelectPlan {
  plan: IPlan;
  type: string;
}

export default function SellerRegistration(props: ISellerRegistrationProps) {
  const { plans, userInfo } = props;

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAgree, setIsAgree] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ISelectPlan | null>(null);
  const [planError, setPlanError] = useState("");
  const [isShowTerms, setIsShowTerms] = useState(false);
  const [isTypeTerms, setIsTypeTerms] = useState<"terms" | "policy">("terms");

  const steps = [
    { id: 1, title: "Thông tin cá nhân", icon: User },
    { id: 2, title: "Gói dịch vụ", icon: Handshake },
    { id: 3, title: "Xác nhận", icon: FileText },
  ];

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async () => {
    try {
      if (!isAgree) {
        toast.warning(
          "Bạn phải đồng ý với điều khoản sử dụng và chính sách bán hàng"
        );
        return;
      }

      if (!selectedPlan) {
        toast.warning("Bạn chưa chọn gói dịch vụ");
        return;
      }

      const resp = await createOrderPlanAction({
        plan_id: selectedPlan.plan.id,
        plan_type: selectedPlan.type,
        vnpay_return_url: `${window.location.origin}/trang-thai-don-hang-goi-dich-vu`,
      });

      console.log("🚀 ~ onSubmit ~ resp:", resp);

      if (!resp || resp.code !== 0) {
        toast.error("Đăng ký gói dịch vụ thất bại");
        return;
      }

      if (resp.data && resp.data.vnp_redirect_url) {
        window.location.replace(resp.data.vnp_redirect_url);
        return;
      } else {
        toast.success("Đăng ký gói dịch vụ thành công!");
        router.push("/trang-thai-don-hang-goi-dich-vu");
        return;
      }
    } catch (error) {
      toast.error("Đăng ký gói dịch vụ thất bại");
      console.log(error);
    }
  };

  const [billingType, setBillingType] = useState<"tháng" | "năm">("tháng");

  const getPrice = (
    prices: Array<{ type: string; price: number }>,
    type: string
  ) => {
    return prices.find((p) => p.type === type)?.price || 0;
  };

  const getYearlySavings = (prices: Array<{ type: string; price: number }>) => {
    const monthlyPrice = getPrice(prices, "tháng");
    const yearlyPrice = getPrice(prices, "năm");
    const monthlyCost = monthlyPrice * 12;
    const savings = ((monthlyCost - yearlyPrice) / monthlyCost) * 100;
    return Math.round(savings);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (userInfo?.partner?.type === "seller") {
    return (
      <div className="">
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Chúc mừng bạn đã trở thành người bán hàng!
                </h1>
                <p className="text-gray-600 text-sm">
                  Tài khoản của bạn đã được kích hoạt thành công
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Bạn có thể bắt đầu bán hàng ngay bây giờ!
                </p>
              </div>

              <div className="space-y-3">
                <Link href="http://localhost:3333" target="_blank">
                  <Button className="w-full">Bắt đầu bán hàng</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Đăng ký bán hàng
          </h1>
          <p className="text-gray-600 text-lg">
            Tham gia cùng chúng tôi để bắt đầu kinh doanh trực tuyến
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-row justify-between items-center overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center space-y-2 min-w-0 flex-1 relative"
                >
                  <div
                    className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        : isCompleted
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      } truncate max-w-20 sm:max-w-none`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-300 -z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-5 h-5",
              })}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              Bước {currentStep} / {steps.length}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Thông tin cá nhân */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Họ và tên</Label>
                  <Input value={userInfo?.full_name || ""} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={userInfo?.email || ""} disabled />
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <Input value={userInfo?.phone_number || ""} disabled />
                </div>
              </div>
            )}

            {/* Step 2: Gói dịch vụ */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg">
                  <div className="container">
                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-12">
                      <div className="bg-muted p-1 rounded-lg">
                        <button
                          onClick={() => setBillingType("tháng")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            billingType === "tháng"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Gói tháng
                        </button>
                        <button
                          onClick={() => setBillingType("năm")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            billingType === "năm"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Gói năm
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                      {plans.map((plan) => {
                        const currentPrice = getPrice(plan.prices, billingType);
                        const yearlySavings = getYearlySavings(plan.prices);

                        return (
                          <Card
                            key={plan.id}
                            className={`${
                              selectedPlan?.plan.id === plan.id &&
                              selectedPlan?.type === billingType
                                ? "border-purple-600 relative"
                                : "border-border"
                            }`}
                          >
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-2xl">
                                {plan.name}
                              </CardTitle>
                              <CardDescription></CardDescription>

                              <div className="mt-4">
                                <span className="text-xl font-bold">
                                  {formatCurrency(currentPrice)}
                                </span>
                                <span className="text-muted-foreground ml-1">
                                  /{billingType}
                                </span>
                                {billingType === "năm" && yearlySavings > 0 && (
                                  <div className="text-sm text-green-600 mt-1">
                                    Tiết kiệm {yearlySavings}% so với thanh toán
                                    hàng tháng
                                  </div>
                                )}
                              </div>

                              <Button
                                type="button"
                                className="w-full mt-6 mb-6"
                                onClick={() => {
                                  setSelectedPlan({
                                    plan: plan,
                                    type: billingType,
                                  });
                                }}
                              >
                                {selectedPlan?.plan.id === plan.id &&
                                selectedPlan?.type === billingType ? (
                                  <span className="flex items-center gap-2">
                                    <Check />
                                    Đã chọn
                                  </span>
                                ) : (
                                  "Chọn gói"
                                )}
                              </Button>
                            </CardHeader>

                            <CardContent className="flex-grow">
                              {/* Store and Product Limits */}
                              <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Số cửa hàng:</span>
                                    <span className="font-medium">
                                      {plan.max_stores_allowed === -1
                                        ? "∞"
                                        : plan.max_stores_allowed}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Sản phẩm/cửa hàng:</span>
                                    <span className="font-medium">
                                      {plan.max_products_per_store === -1
                                        ? "∞"
                                        : plan.max_products_per_store}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              {/* Features */}
                              <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                  <li
                                    key={feature}
                                    className="flex items-center"
                                  >
                                    <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {planError && !selectedPlan && (
                  <div className="text-red-500 text-sm text-center mt-2">
                    {planError}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Xác nhận */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">
                    Thông tin đăng ký
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Họ tên:</p>
                      <p className="text-gray-600">{userInfo?.full_name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email:</p>
                      <p className="text-gray-600">{userInfo?.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Số điện thoại:
                      </p>
                      <p className="text-gray-600">{userInfo?.phone_number}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Gói dịch vụ:</p>
                      <p className="text-gray-600">{selectedPlan?.plan.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Loại thanh toán:
                      </p>
                      <p className="text-gray-600">Hằng {selectedPlan?.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap text-sm leading-relaxed">
                    <Checkbox
                      id="agreeTerms"
                      checked={isAgree}
                      onCheckedChange={(checked) =>
                        setIsAgree(checked === true)
                      }
                    />
                    <Label htmlFor="agreeTerms" className="cursor-pointer">
                      Tôi đồng ý với
                    </Label>
                    <span
                      onClick={() => {
                        setIsShowTerms(true);
                        setIsTypeTerms("terms");
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Điều khoản sử dụng
                    </span>
                    <span>và</span>
                    <span
                      onClick={() => {
                        setIsShowTerms(true);
                        setIsTypeTerms("policy");
                      }}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Chính sách bán hàng
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                Quay lại
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={() => {
                    if (currentStep === 2) {
                      if (!selectedPlan) {
                        setPlanError(
                          "Vui lòng chọn một gói dịch vụ để tiếp tục."
                        );
                        return;
                      } else {
                        setPlanError("");
                      }
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="w-full sm:w-auto"
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  Hoàn tất đăng ký
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dễ dàng bán hàng</h3>
            <p className="text-gray-600 text-sm">
              Giao diện đơn giản, dễ sử dụng cho người bán
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Hỗ trợ 24/7</h3>
            <p className="text-gray-600 text-sm">
              Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Phí thấp</h3>
            <p className="text-gray-600 text-sm">
              Chi phí hoa hồng cạnh tranh nhất thị trường
            </p>
          </div>
        </div>
      </div>
      {isShowTerms && (
        <Dialog open={isShowTerms} onOpenChange={setIsShowTerms}>
          <DialogContent className="w-full max-w-[90vw] md:max-w-2xl h-full max-h-[90vh] p-0">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {isTypeTerms === "terms" ? (
              <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-white rounded-xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    ĐIỀU KHOẢN SỬ DỤNG HUYSHOP
                  </h1>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    1. Giới thiệu
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Chào mừng quý khách đến với HuyShop. Bằng việc truy cập và
                    sử dụng website này, quý khách đồng ý tuân thủ các điều
                    khoản sau đây.
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    2. Đăng ký tài khoản
                  </h2>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    2.1. Yêu cầu
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                    <li>Khách hàng từ 18 tuổi trở lên</li>
                    <li>Cung cấp thông tin chính xác khi đăng ký</li>
                    <li>Bảo mật tài khoản và mật khẩu</li>
                  </ul>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    2.2. Quyền hạn
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      HuyShop có quyền từ chối đăng ký không cần báo trước
                    </li>
                    <li>
                      Khách hàng chịu trách nhiệm cho mọi hoạt động từ tài khoản
                    </li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    3. Quyền sở hữu trí tuệ
                  </h2>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-yellow-700 font-medium">
                      Toàn bộ nội dung trên website thuộc bản quyền của HuyShop.
                      Mọi sao chép đều bị nghiêm cấm.
                    </p>
                  </div>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    3.1. Hạn chế sử dụng
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Không sao chép, phân phối nội dung trái phép</li>
                    <li>Không sử dụng robot thu thập dữ liệu tự động</li>
                    <li>Không đảo ngược kỹ thuật bất kỳ thành phần nào</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    4. Hành vi bị cấm
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Đăng nội dung vi phạm pháp luật</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Gửi thư rác, phần mềm độc hại</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Mạo danh tổ chức/ cá nhân khác</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Can thiệp hệ thống bảo mật</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Liên hệ
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Công ty TNHH HuyShop</span>
                    </p>
                    <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
                    <p>
                      Điện thoại:{" "}
                      <span className="font-medium">0123 456 789</span>
                    </p>
                    <p>
                      Email:{" "}
                      <span className="font-medium">support@huyshop.com</span>
                    </p>
                    <p>Giờ làm việc: Thứ 2 - Thứ 6 (8:00 - 17:00)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-white rounded-xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    CHÍNH SÁCH BÁN HÀNG HUYSHOP
                  </h1>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    1. Giới thiệu
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Chào mừng quý khách đến với HuyShop. Bằng việc truy cập và
                    sử dụng website này, quý khách đồng ý tuân thủ các điều
                    khoản sau đây.
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    2. Đăng ký tài khoản
                  </h2>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    2.1. Yêu cầu
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                    <li>Khách hàng từ 18 tuổi trở lên</li>
                    <li>Cung cấp thông tin chính xác khi đăng ký</li>
                    <li>Bảo mật tài khoản và mật khẩu</li>
                  </ul>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    2.2. Quyền hạn
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      HuyShop có quyền từ chối đăng ký không cần báo trước
                    </li>
                    <li>
                      Khách hàng chịu trách nhiệm cho mọi hoạt động từ tài khoản
                    </li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    3. Quyền sở hữu trí tuệ
                  </h2>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-yellow-700 font-medium">
                      Toàn bộ nội dung trên website thuộc bản quyền của HuyShop.
                      Mọi sao chép đều bị nghiêm cấm.
                    </p>
                  </div>

                  <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">
                    3.1. Hạn chế sử dụng
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Không sao chép, phân phối nội dung trái phép</li>
                    <li>Không sử dụng robot thu thập dữ liệu tự động</li>
                    <li>Không đảo ngược kỹ thuật bất kỳ thành phần nào</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">
                    4. Hành vi bị cấm
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Đăng nội dung vi phạm pháp luật</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Gửi thư rác, phần mềm độc hại</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Mạo danh tổ chức/ cá nhân khác</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">
                        •
                      </div>
                      <p className="ml-2">Can thiệp hệ thống bảo mật</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Liên hệ
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Công ty TNHH HuyShop</span>
                    </p>
                    <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
                    <p>
                      Điện thoại:{" "}
                      <span className="font-medium">0123 456 789</span>
                    </p>
                    <p>
                      Email:{" "}
                      <span className="font-medium">support@huyshop.com</span>
                    </p>
                    <p>Giờ làm việc: Thứ 2 - Thứ 6 (8:00 - 17:00)</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
