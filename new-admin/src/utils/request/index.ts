import type { Options } from "ky";

import { loginPath } from "#src/router/extra-info";
import { usePreferencesStore } from "#src/store";
import ky from "ky";

import { AUTH_HEADER, LANG_HEADER } from "./constants";
import { globalProgress } from "./global-progress";
import useAuthStore from "#src/store/auth.js";
// 请求白名单, 请求白名单内的接口不需要携带 token
const requestWhiteList = [loginPath];

// 请求超时时间
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

const defaultConfig: Options = {
	// The input argument cannot start with a slash / when using prefixUrl option.
	prefixUrl: import.meta.env.VITE_API_BASE_URL,
	timeout: API_TIMEOUT,
	retry: {
		// 当请求失败时，最多重试次数
		limit: 3,
	},

	hooks: {
		beforeRequest: [
			(request, options) => {
				const ignoreLoading = options.ignoreLoading;
				if (!ignoreLoading) {
					globalProgress.start();
				}
				// 不需要携带 token 的请求
				const isWhiteRequest = requestWhiteList.some((url) =>
					request.url.endsWith(url),
				);
				if (!isWhiteRequest) {
					const { accessToken } = useAuthStore.getState().userToken;
					request.headers.set(AUTH_HEADER, accessToken);
				}
				// 语言等所有的接口都需要携带
				request.headers.set(
					LANG_HEADER,
					usePreferencesStore.getState().language,
				);
			},
		],
		afterResponse: [
			async (request, options, response) => {
				const ignoreLoading = options.ignoreLoading;
				if (!ignoreLoading) {
					globalProgress.done();
				}
				// request error
				if (!response.ok && response.status !== 401) {
					useAuthStore.getState().actions.clearUserToken();
					return response;
				}
				// request success
				return response;
			},
		],
	},
};

export const request = ky.create(defaultConfig);
