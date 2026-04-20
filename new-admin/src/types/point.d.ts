import { IUser } from "./user";

interface IPointTransaction {
  id: string;
  receiver_id: string;
  receiver: IUser;
  points: number;
  description: string;
  created_at: number;
}

interface IPointTransactionRequest {
  receiver_id?: string;
  limit?: number;
  skip?: number;
}

interface IPointTransactionResponse {
  point_exchanges: IPointTransaction[];
  total: number;
}
