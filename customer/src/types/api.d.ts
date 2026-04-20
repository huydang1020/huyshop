interface IResponseAPI<T> {
  code: number;
  message: string;
  data: T;
  type?: string;
}

interface ISignInRequest {
  username: string;
  password: string;
}

interface ISignInResponse {
  user: IUser;
  accessToken: string;
}
interface IUser {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  username: string;
  role_id: string;
  partner_id: string;
  partner: IPartner;
  state: string;
  birthday: number;
  avatar: string;
  cart_quantity: number;
  favorite_quantity: number;
  total_amount_spent: number;
  total_earned_points: number;
  total_orders: number;
  created_at: number;
  updated_at: number;
}

interface IQueryProductType {
  quantity_sold?: number;
  quantity_search?: number;
  views?: number;
  order_by?: string;
  state?: string;
  limit?: number;
  skip?: number;
  category?: string;
  price_from?: number;
  price_to?: number;
  name?: string;
}

interface IDataHomePage {
  banners: IBanner[];
  categories: ICategory[];
}

interface IDataProductType {
  product_types: IProductType[];
  total: number;
}

interface IBanner {
  id: string;
  name: string;
  image: string;
  url: string;
  type: string;
  order: number;
  state: string;
  created_at: number;
  updated_at: number;
}

interface ICategory {
  id: string;
  name: string;
  logo: string;
  state: string;
  slug: string;
  created_at: number;
  updated_at: number;
}

interface IPartner {
  id: string;
  name: string;
  type: string;
  state: string;
  created_at: number;
  updated_at: number;
}

interface IStore {
  id: string;
  name: string;
  logo: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  lng: string;
  lat: string;
  partner_id: string;
  partner: IPartner;
  phone_number: string;
  description: string;
  state: string;
  slug: string;
  full_address: string;
  created_at: number;
  updated_at: number;
}

interface IStoreInfoResponse {
  store: IStore;
  product_types: IDataProductType;
}

interface IProductType {
  id: string;
  name: string;
  category_id: string;
  category: ICategory;
  description: string;
  partner_id: string;
  partner: IPartner;
  store_id: string;
  store: IStore;
  products: IProduct[];
  quantity_sold: number;
  quantity_search: number;
  product_details: Record<string, string>;
  slug: string;
  state: string;
  average_rating: number;
  views: number;
  created_at: number;
  updated_at: number;
}

interface IProduct {
  id: string;
  name: string;
  image: string;
  product_type_id: string;
  product_type: IProductType;
  state: string;
  origin_price: number;
  sell_price: number;
  attribute_values: Record<string, string>;
  quantity: number;
  created_at: number;
  updated_at: number;
}

interface ICategoryRequest {
  state?: string;
  limit?: number;
  skip?: number;
}

interface ICategoryResponse {
  categories: ICategory[];
  total: number;
}

interface ICartItem {
  product_id: string;
  quantity: number;
  product?: IProduct;
}

interface ICartResponse {
  stores: (IStore & { products: IProductCartResponse[] })[];
}

interface IProductCartResponse {
  product_id: string;
  product: IProduct;
  quantity: number;
}

interface ISendOtpRequest {
  username?: string;
  email?: string;
  verify_otp?: string;
}

interface ISendOtpResponse {
  ttl: number;
}

interface ICheckoutRequest {
  product_ordered: IOrderDetail[];
  user_address_id: string;
  total_money: number;
  method_payment: string;
  shipping_name: string;
  shipping_fee: number;
  vnpay_return_url: string;
}

interface IOrderDetail {
  product_id: string;
  quantity: number;
}

interface ICheckoutResponse {
  vnp_redirect_url?: string;
}

interface IPlan {
  id: string;
  name: string;
  state: string;
  features: string[];
  prices: IPlanPrice[];
  max_stores_allowed: number;
  max_products_per_store: number;
  created_at: number;
  updated_at: number;
}

interface IPlanPrice {
  type: string;
  price: number;
}

interface IPlanResponse {
  plans: IPlan[];
  total: number;
}

interface ICreateOrderPlan {
  plan_id: string;
  plan_type: string;
  vnpay_return_url: string;
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

interface IOrder {
  id: string;
  order_code: string;
  user_id: string;
  time_order: number;
  product_ordered: IProductOrdered[];
  state: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  total_money: number;
  shipping_fee: number;
  method_payment: string;
  history: string;
}

interface IProductOrdered {
  product_id: string;
  product: IProduct;
  quantity: number;
}

interface IListFavoriteProductResponse {
  product_types: IProductType[];
  total: number;
}

interface IReview {
  id: string;
  user_id: string;
  user: IUser;
  product_id: string;
  order_id: string;
  rating: number;
  content: string;
  seller_reply: string;
  seller_reply_at: number;
  images?: string[];
  created_at: number;
  updated_at: number;
}

interface IReviewRequest {
  product_id?: string;
  order_id?: string;
  limit?: number;
  skip?: number;
}

interface IReviewResponse {
  reviews: IReview[];
  total: number;
}

interface IVoucher {
  id: string;
  name: string;
  discount_cash: number;
  discount_percent: number;
  max_discount_cash_value: number;
  min_total_bill_value: number;
  partner_id: string;
  partner: IPartner;
  store_ids: string;
  stores: IStore[];
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
  state?: string;
  limit?: number;
  skip?: number;
}

interface IVoucherResponse {
  vouchers: IVoucher[];
  total: number;
}

interface ICode {
  id: string;
  code: string;
  voucher_id: string;
  voucher: IVoucher;
  state: string;
  used_at: number;
  created_at: number;
  updated_at: number;
}

interface IUserVoucher {
  id: string;
  user_id: string;
  user: IUser;
  voucher_id: string;
  voucher: IVoucher;
  state: string;
  code_id: string;
  code: ICode;
  used_at: number;
  created_at: number;
  updated_at: number;
}

interface IUserVoucherRequest {
  is_still_valid?: string;
  state?: string;
  limit?: number;
  skip?: number;
}

interface IUserVoucherResponse {
  user_vouchers: IUserVoucher[];
  total: number;
}

interface IVerifyCodeRequest {
  code_id: string;
  voucher_id: string;
  total_bill: number;
}

interface IUserAddress {
  id: string;
  user_id: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  full_address: string;
  full_name: string;
  phone: string;
  is_default: string;
  created_at: number;
}

interface IUserAddressRequest {
  is_default?: string;
}

interface IUserAddressResponse {
  user_addresses: IUserAddress[];
  total: number;
}

interface IPointExchange {
  id: string;
  receiver_id: string;
  receiver: IUser;
  points: number;
  description: string;
  created_at: number;
}

interface IPointExchangeRequest {
  limit?: number;
  skip?: number;
}

interface IPointExchangeResponse {
  point_exchanges: IPointExchange[];
  total: number;
}
