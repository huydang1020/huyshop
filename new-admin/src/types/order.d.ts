export interface IOrder {
  id: string;
  order_code: string;
  user_id: string;
  time_order: number;
  product_ordered: IProductOrdered[];
  state: string;
  total_money: number;
  shipping_name: string;
  shipping_fee: number;
  method_payment: string;
  history: string;
  partner_id: string;
  order_ship_id: string;
  store_id: string;
  cancel_order: string;
  user_address_id: string;
  user_address: IUserAddress;
}

interface IUserAddress {
  id: string;
  user_id: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  is_default: string;
  full_name: string;
  phone: string;
  full_address: string;
  created_at: number;
}

export interface IProductOrdered {
  product_id: string;
  product: IProduct;
  quantity: number;
}

interface IOrderRequest {
  state?: string;
  limit?: number;
  skip?: number;
}

interface IOrderResponse {
  orders: IOrder[];
  total: number;
}
