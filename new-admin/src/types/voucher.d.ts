interface IVoucher {
  id: string;
  name: string;
  discount_cash: number;
  discount_percent: number;
  max_discount_cash_value: number;
  min_total_bill_value: number;
  partner_id: string;
  partner: string;
  store_ids: string;
  stores: string;
  image: string;
  description: string;
  total_quantity: number;
  remaining_quantity: number;
  start_at: number;
  end_at: number;
  type: string;
  point_exchange: number;
  state: string;
  created_at: number;
  updated_at: number;
}

interface IVoucherRequest {
  limit?: number;
  skip?: number;
  state?: string;
}

interface IVoucherResponse {
  vouchers: IVoucher[];
  total: number;
}
