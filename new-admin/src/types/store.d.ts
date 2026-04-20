interface IStore {
  id: string;
  name: string;
  logo: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  lat: string;
  lng: string;
  phone_number: string;
  description: string;
  partner_id: string;
  state: string;
  created_at: number;
  updated_at: number;
}

interface IStoreRequest {
  limit?: number;
  skip?: number;
  state?: string;
}

interface IStoreResponse {
  stores: IStore[];
  total: number;
}
