import { SignUp } from "@/components/signup";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký",
};

export default function RegisterPage() {
  const access_token = cookies().get("access_token")?.value;
  if (access_token) {
    redirect("/");
  }
  return <SignUp />;
}
