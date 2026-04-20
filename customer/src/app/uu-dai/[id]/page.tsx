import VoucherDetail from "@/components/voucher-detail";
import voucherService from "@/services/voucher.service";
import { cookies } from "next/headers";

export default async function VoucherDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const accessToken = cookies().get("access_token")?.value;
  const [resp, userVouchersFree] = await Promise.all([
    voucherService.getVoucher(params.id),
    voucherService.getListUserVoucherFree(accessToken || ""),
  ]);
  return (
    <VoucherDetail
      voucher={resp.data || ({} as IVoucher)}
      accessToken={accessToken || ""}
      userVouchersFree={userVouchersFree.data?.user_vouchers || []}
    />
  );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const response = await voucherService.getVoucher(params.id);
  const voucher = response.data || {};
  return {
    title: voucher.name,
  };
}
