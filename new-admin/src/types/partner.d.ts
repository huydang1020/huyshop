interface IPartner {
  id: string;
  name: string;
  type: string;
  state: string;
  max_stores_allowed: number;
  current_stores_count: number;
  max_products_per_store: number;
  plan_id: string;
  plan: IPlan;
  plan_expired_at: number;
  plan_type: string;
  created_at: number;
  updated_at: number;
}

interface IPartnerRequest {
  type?: string;
  limit?: number;
  skip?: number;
}

interface IPartnerResponse {
  partners: IPartner[];
  total: number;
}
