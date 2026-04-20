"use server";
import userService from "@/services/user.service";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function sendOtpAction(data: ISendOtpRequest) {
  const resp = await userService.sendOtp(data);
  return resp;
}

export async function verifyOtpAction(username: string, verify_otp: string) {
  const resp = await userService.verifyOtp({ username, verify_otp });
  return resp;
}

export async function getListUserAddressAction(accessToken: string) {
  const resp = await userService.getListUserAddress(accessToken);
  return resp;
}

export async function createUserAddressAction(data: IUserAddress) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.createUserAddress(accessToken, data);
  if (resp.code === 0) {
    revalidateTag("user-address-list");
  }
  return resp;
}

export async function updateUserAddressAction(id: string, data: IUserAddress) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.updateUserAddress(accessToken, id, data);
  if (resp.code === 0) {
    revalidateTag("user-address-list");
  }
  return resp;
}

export async function deleteUserAddressAction(id: string) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.deleteUserAddress(accessToken, id);
  if (resp.code === 0) {
    revalidateTag("user-address-list");
  }
  return resp;
}
export async function updateProfileAction(data: IUser) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.updateProfile(accessToken, data);
  if (resp.code === 0) {
    revalidateTag("user-info");
  }
  return resp;
}

export async function changePasswordAction(
  old_password: string,
  new_password: string
) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.changePassword(
    accessToken,
    old_password,
    new_password
  );
  return resp;
}

export async function listPointExchangeAction(query: IPointExchangeRequest) {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) {
    return;
  }
  const resp = await userService.listPointExchange(accessToken, query);
  return resp;
}
