import LoginRequiredPage from "@/components/login-required";
import { Profile } from "@/components/profile";
import authService from "@/services/auth.service";
import userService from "@/services/user.service";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Thông tin tài khoản",
  description: "Thông tin tài khoản",
};

export default async function ProfilePage() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return <LoginRequiredPage page_redirect="thong-tin-tai-khoan" />;
  }
  const [userInfo, listUserAddress, listPointExchange] = await Promise.all([
    authService.getUser(accessToken),
    userService.getListUserAddress(accessToken),
    userService.listPointExchange(accessToken, { limit: 10, skip: 0 }),
  ]);
  return (
    <Profile
      userInfo={userInfo.data || {}}
      listUserAddress={listUserAddress.data || {}}
      listPointExchange={listPointExchange.data || {}}
    />
  );
}
