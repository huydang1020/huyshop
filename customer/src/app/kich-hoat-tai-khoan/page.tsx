import ActiveAccount from "@/components/active-account";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kích hoạt tài khoản",
  description: "Kích hoạt tài khoản",
};

export default function VerifyAccountPage({
  searchParams,
}: {
  searchParams: { username: string };
}) {
  return <ActiveAccount username={searchParams.username} />;
}
