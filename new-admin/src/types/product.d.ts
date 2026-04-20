interface IProductType {
  id: string;
  name: string;
  category_id: string;
  category?: ICategory;
  description: string;
  partner_id?: string;
  partner?: IPartner;
  store_id: string;
  store?: IStore;
  product_details: Record<string, string>;
  products: IProduct[];
  quantity_sold?: number;
  views?: number;
  state?: string;
  created_at?: number;
  updated_at?: number;
}

interface IProduct {
  id: string;
  name: string;
  image: string;
  origin_price: number;
  sell_price: number;
  attribute_values: Record<string, string>;
  product_type_id: string;
  origin_price: number;
  sell_price: number;
  quantity: number;
  state: string;
  created_at: number;
  updated_at: number;
}

interface IProductTypeRequest {
  limit?: number;
  skip?: number;
}

interface IProductTypeResponse {
  product_types: IProductType[];
  total: number;
}
