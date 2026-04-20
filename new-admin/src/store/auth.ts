import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as AuthService from "#src/services/auth";
import { toastUtil } from "../components/toast";
import { ISignInRequest, IUser, IUserToken } from "#src/types/user.js";
import { useTranslation } from "react-i18next";
const { VITE_BASE_HOME_PATH: HOMEPAGE } = import.meta.env;

type AuthStore = {
  userInfo: IUser;
  userToken: IUserToken;
  actions: {
    setUserInfo: (userInfo: IUser) => void;
    setUserToken: (token: IUserToken) => void;
    clearUserToken: () => void;
    clearUserInfo: () => void;
  };
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userToken: {} as IUserToken,
      userInfo: {} as IUser,
      actions: {
        setUserInfo: (userInfo) => {
          set({ userInfo });
        },
        setUserToken: (userToken) => {
          set({ userToken });
        },
        clearUserToken() {
          set({ userToken: { accessToken: "" } });
        },
        clearUserInfo() {
          set({ userInfo: {} as IUser });
        },
      },
    }),
    {
      name: "authStore",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userToken: state.userToken,
      }),
    }
  )
);

export const useUserInfo = () => useAuthStore((state) => state.userInfo);
export const useUserToken = () => useAuthStore((state) => state.userToken);
export const useUserActions = () => useAuthStore((state) => state.actions);

export const useSignIn = () => {
  const navigate = useNavigate();
  const { setUserToken } = useUserActions();
  const { t } = useTranslation();
  const signInMutation = useMutation({
    mutationFn: AuthService.signin,
  });

  const signIn = async (data: ISignInRequest) => {
    try {
      const res = await signInMutation.mutateAsync(data);
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { accessToken } = res.data;
      setUserToken({ accessToken });
      window.location.href = HOMEPAGE;
      toastUtil.success(t("authority.loginSuccess"));
      return;
    } catch (err: any) {
      console.log("🚀 ~ signIn ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return signIn;
};

export const getUserInfo = () => {
  const { setUserInfo } = useUserActions();
  const userMutation = useMutation({
    mutationFn: AuthService.getUserInfoFromToken,
  });
  const getUserInfo = async () => {
    try {
      const res = await userMutation.mutateAsync();
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      setUserInfo(res.data);
      return res.data;
    } catch (err: any) {
      console.log("🚀 ~ getUserInfo ~ err:", err);
      toastUtil.error(err.message);
    }
  };
  return getUserInfo;
};

export default useAuthStore;
