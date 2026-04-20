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

interface IBannerRequest {
  limit?: number;
  skip?: number;
}

interface IBannerResponse {
  banners: IBanner[];
  total: number;
}
