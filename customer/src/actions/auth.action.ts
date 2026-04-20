"use server";

import authService from "@/services/auth.service";
import { cookies } from "next/headers";

export async function signInAction(data: ISignInRequest) {
  const resp = await authService.signIn(data);
  if (resp.code === 0 && resp.data) {
    cookies().set("access_token", resp.data.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return resp;
}

export async function signInAfterVerifyOtpAction(data: ISignInRequest) {
  const resp = await authService.signInAfterVerifyOtp(data);
  if (resp.code === 0 && resp.data) {
    cookies().set("access_token", resp.data.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return resp;
}

export async function signOutAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await authService.signOut(accessToken);
    if (resp.code === 0) {
      cookies().delete("access_token");
    }
    return resp;
  }
  return null;
}

export async function signUpAction(data: IUser) {
  const resp = await authService.signUp(data);
  return resp;
}

export async function getUserInfoAction() {
  const accessToken = cookies().get("access_token")?.value;
  if (accessToken) {
    const resp = await authService.getUser(accessToken);
    return resp;
  }
  return null;
}
