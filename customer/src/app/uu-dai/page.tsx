import ListVoucher from "@/components/voucher";
import voucherService from "@/services/voucher.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ưu đãi",
  description: "Ưu đãi",
};

export default async function VoucherPage() {
  let listVoucher: IVoucherResponse = { vouchers: [], total: 0 };
  const resp = await voucherService.getListVoucher();
  if (resp.code === 0) {
    listVoucher = resp.data;
  }
  return <ListVoucher listVoucher={listVoucher} />;
}
