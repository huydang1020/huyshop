"use server";

import uploadService from "@/services/upload.service";

export async function uploadImageAction(data: FormData) {
  const resp = await uploadService.uploadImage(data);
  return resp;
}
