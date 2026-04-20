interface ICategory {
  id: string;
  name: string;
  logo: string;
  state: string;
  created_at: number;
  updated_at: number;
}

interface ICategoryRequest {
  limit?: number;
  skip?: number;
  state?: string;
}

interface ICategoryResponse {
  categories: ICategory[];
  total: number;
}
