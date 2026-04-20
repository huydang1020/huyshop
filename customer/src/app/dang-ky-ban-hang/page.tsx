import SellerRegistration from "@/components/seller-registration";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import planService from "@/services/plan.service";
import LoginRequiredPage from "@/components/login-required";
import authService from "@/services/auth.service";

export const metadata: Metadata = {
  title: "Đăng ký bán hàng",
  description: "Đăng ký bán hàng",
};

export default async function RegisterSellerPage() {
  try {
    const accessToken = cookies().get("access_token")?.value;
    if (!accessToken) {
      return <LoginRequiredPage page_redirect="dang-ky-ban-hang" />;
    }
    const resp = await planService.listPlan(accessToken);
    if (resp.code !== 0) {
      throw new Error(resp.message);
    }
    const userInfo = await authService.getUser(accessToken);
    return (
      <SellerRegistration
        plans={resp.data.plans}
        userInfo={userInfo.data || {}}
      />
    );
  } catch (error) {
    console.log("🚀 ~ RegisterSellerPage ~ error:", error);
    throw error;
  }
}
