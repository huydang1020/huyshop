import { toast } from "sonner";

const BASE_URL = process.env.NEXT_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Lỗi định dạng dữ liệu");
  }
  if (!data) throw new Error("Có lỗi xảy ra!");
  return data;
}

class APIClient {
  async get<T = any>(config: RequestInit & { url: string }): Promise<T> {
    return this.request<T>({ ...config, method: "GET" });
  }

  async post<T = any>(config: RequestInit & { url: string }): Promise<T> {
    return this.request<T>({ ...config, method: "POST" });
  }

  async put<T = any>(config: RequestInit & { url: string }): Promise<T> {
    return this.request<T>({ ...config, method: "PUT" });
  }

  async delete<T = any>(config: RequestInit & { url: string }): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE" });
  }

  async request<T = any>(
    config: RequestInit & { url: string; body?: any }
  ): Promise<T> {
    const { url, headers, body, ...rest } = config;

    // Check if body is FormData - if so, don't set Content-Type to let browser handle it
    const isFormData = body instanceof FormData;

    try {
      const response = await fetch(
        `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`,
        {
          headers: {
            // Only set Content-Type if it's not FormData
            ...(isFormData
              ? {}
              : { "Content-Type": "application/json;charset=utf-8" }),
            ...(headers || {}),
            "Accept-Language": "vi-VN",
          },
          body,
          ...rest,
        }
      );
      if (!response.ok) {
        let errMsg = `Lỗi: ${response.status}`;
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch {}
        toast.error(errMsg, { position: "top-center" });
        throw new Error(errMsg);
      }
      return await handleResponse<T>(response);
    } catch (error: any) {
      console.log(error);
      throw new Error("Có lỗi xảy ra!");
    }
  }
}

export const apiClient = new APIClient();
