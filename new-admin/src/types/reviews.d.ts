import { IUser } from "./user";

export interface IReviews {
  id: string;
  user_id: string;
  user: IUser;
  product_id: string;
  product: IProduct;
  content: string;
  rating: number;
  images: string[];
  state: string;
  seller_reply: string;
  seller_reply_at: number;
  created_at: number;
  updated_at: number;
}

interface IReviewsRequest {
  state?: string;
  limit?: number;
  skip?: number;
}

interface IReviewsResponse {
  reviews: IReviews[];
  total: number;
}
