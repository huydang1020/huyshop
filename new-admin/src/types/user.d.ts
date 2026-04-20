import dayjs from "dayjs";

interface ISignInRequest {
  username: string;
  password: string;
}

interface ISignInResponse {
  user: IUser;
  accessToken: string;
}

interface IUserToken {
  accessToken: string;
}
interface IUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  username: string;
  password: string;
  role_id: string;
  partner_id?: string;
  partner?: IPartner;
  role?: IRole;
  province: string;
  district: string;
  ward: string;
  address: string;
  avatar: string;
  birthday: number | dayjs.Dayjs;
  state: string;
  point?: IUserPoint;
  created_at: number;
  updated_at: number;
}

interface IUserPoint {
  user_id: string;
  points: number;
  total_points: number;
  created_at: number;
}

interface IUserRequest {
  id?: string;
  full_name?: string;
  phone_number?: string;
  username?: string;
  role_id?: string;
  state?: string;
  limit?: number;
  skip?: number;
}

interface IUserResponse {
  users: IUser[];
  total: number;
}
