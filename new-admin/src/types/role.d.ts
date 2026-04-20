interface IRole {
  id: string;
  name: string;
  description: string;
  state: string;
  role_group?: string[];
  groups?: IRoleGroup[];
  created_at: number;
  updated_at: number;
}

interface IRoleGroup {
  group: string;
  actions: string[];
}

interface IRoleRequest {
  limit?: number;
  skip?: number;
}

interface IRoleResponse {
  roles: IRole[];
  total: number;
}
