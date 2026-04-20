interface IOverview {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_product: number;
  total_partners: number;
  total_stores: number;
  total_vouchers: number;
  total_code_used: number;
  order_status: {
    cancelled: number;
    completed: number;
    confirmed: number;
    pending: number;
    processing: number;
    shipping: number;
  };
}

interface IOverviewRequest {
  start_date?: string;
  end_date?: string;
}

interface IRevenue {
  labels: string[];
  values: number[];
}

interface IRevenueRequest {
  partner_id?: string;
  group_by?: "month" | "year";
  month?: number;
  year?: number;
}

interface IReportProductRequest {
  order_by?: string;
}

interface IReportProductResponse {
  data: Record<string, number>;
}
