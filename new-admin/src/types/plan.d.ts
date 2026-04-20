import { IUser } from "./user";

interface IPlan {
  id: string;
  name: string;
  features: string[];
  prices: IPlanPrice[];
  max_stores_allowed: number;
  max_products_per_store: number;
  state: string;
  created_at: number;
  updated_at: number;
}

interface IPlanPrice {
  type: string;
  price: number;
}

interface IPlanRequest {
  limit?: number;
  skip?: number;
}

interface IPlanResponse {
  plans: IPlan[];
  total: number;
}

interface IOrderPlanRequest {
  limit?: number;
  skip?: number;
}

interface IOrderPlanResponse {
  order_plans: IOrderPlan[];
  total: number;
}

interface IOrderPlan {
  id: string;
  user_id: string;
  user: IUser;
  plan_id: string;
  plan: IPlan;
  order_code: string;
  type: string;
  plan_type: string;
  plan_price: number;
  created_at: number;
  updated_at: number;
}

interface ICreateOrderPlanRequest {
  plan_id: string;
  plan_type: string;
  vnpay_return_url: string;
}
