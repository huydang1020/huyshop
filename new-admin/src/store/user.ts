import { useMutation } from "@tanstack/react-query";
import { IUser, IUserRequest } from "#src/types/user.js";
import { create } from "zustand";
import * as userService from "#src/services/user";
import { toastUtil } from "../components/toast";

type UserStore = {
  loading: boolean;
  users: IUser[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setUsers: (users: IUser[]) => void;
    setTotal: (total: number) => void;
    clearUsers: () => void;
  };
};

const useUserStore = create<UserStore>()((set) => ({
  loading: false,
  users: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setUsers: (users) => {
      set({ users });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearUsers() {
      set({ users: [] });
    },
  },
}));

export const useUsers = () => useUserStore((state) => state.users);
export const useUserActions = () => useUserStore((state) => state.actions);

export const useListUser = () => {
  const { setUsers, setTotal, setLoading } = useUserActions();

  const userMutation = useMutation({
    mutationFn: userService.getListUser,
  });

  const listUser = async (params?: IUserRequest) => {
    try {
      setLoading(true);
      const res = await userMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { users, total } = res.data;
      setUsers(users);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listUser ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listUser;
};

export const useCreateUser = () => {
  const userMutation = useMutation({
    mutationFn: userService.createUser,
  });

  const createUser = async (data: IUser) => {
    try {
      const res = await userMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ createUser ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return createUser;
};

export const useUpdateUser = () => {
  const userMutation = useMutation({
    mutationFn: userService.updateUser,
  });

  const updateUser = async (data: IUser) => {
    try {
      const res = await userMutation.mutateAsync(data);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateUser ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateUser;
};

export const useDeleteUser = () => {
  const userMutation = useMutation({
    mutationFn: userService.deleteUser,
  });
  const deleteUser = async (id: string) => {
    try {
      const res = await userMutation.mutateAsync(id);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ deleteUser ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return deleteUser;
};

export default useUserStore;
