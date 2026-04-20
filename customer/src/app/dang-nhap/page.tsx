import type { Metadata } from "next";
import { SignIn } from "@/components/signin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const access_token = cookies().get("access_token")?.value;
  if (access_token) {
    redirect("/");
  }
  const redirectPage = searchParams.redirect as string;
  return <SignIn redirect={redirectPage} />;
}
