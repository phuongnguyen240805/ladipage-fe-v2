import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  RESPONSE_SUCCESS_CODE,
  type ResOp,
} from "@liora/api-types";
import {
  ApiBusinessError,
  AUTH_SESSION_ERROR_CODES,
  mapSessionErrorMessage,
} from "@/features/auth/utils/auth-error-messages";
import { isSessionRedirectSuppressed } from "@/features/auth/utils/auth-session-guard";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { tokenRefreshService } from "@/features/auth/services/token-refresh.service";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
}

function unwrapResOp<T>(payload: ResOp<T>): T {
  if (payload.code !== RESPONSE_SUCCESS_CODE) {
    const code = Number(payload.code);
    const message = payload.message || `API error code ${payload.code}`;
    throw new ApiBusinessError(Number.isFinite(code) ? code : -1, message);
  }
  return payload.data;
}

async function refreshNestTokenOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = tokenRefreshService
      .refreshNestToken()
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function redirectToSignIn(): void {
  if (isSessionRedirectSuppressed()) {
    return;
  }
  useAuthStore.getState().clearAllAuth();
  if (typeof window !== "undefined") {
    const redirect = encodeURIComponent(window.location.pathname);
    window.location.href = `/signin?redirect=${redirect}`;
  }
}

async function handleSessionInvalid(
  instance: AxiosInstance,
  config: RetryableConfig,
  code: number,
  message?: string
): Promise<AxiosResponse> {
  if (code === 1101 && !config._retry) {
    config._retry = true;
    try {
      const newToken = await refreshNestTokenOnce();
      config.headers.Authorization = `Bearer ${newToken}`;
      return instance.request(config);
    } catch {
      // fall through to sign-out
    }
  }

  redirectToSignIn();
  throw new ApiBusinessError(code, mapSessionErrorMessage(code, message));
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().platform.nestToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    async (response) => {
      const body = response.data as ResOp<unknown>;
      if (
        body &&
        typeof body === "object" &&
        "code" in body &&
        "data" in body
      ) {
        const code = Number(body.code);
        if (AUTH_SESSION_ERROR_CODES.has(code)) {
          return handleSessionInvalid(
            instance,
            response.config as RetryableConfig,
            code,
            body.message
          );
        }
        response.data = unwrapResOp(body);
      }
      return response;
    },
    async (error: AxiosError<ResOp<unknown>>) => {
      const config = error.config as RetryableConfig | undefined;
      const status = error.response?.status;
      const businessCode = Number(error.response?.data?.code);

      if (
        config &&
        AUTH_SESSION_ERROR_CODES.has(businessCode)
      ) {
        return handleSessionInvalid(
          instance,
          config,
          businessCode,
          error.response?.data?.message
        );
      }

      if (status === 401 && config && !config._retry) {
        config._retry = true;
        try {
          const newToken = await refreshNestTokenOnce();
          config.headers.Authorization = `Bearer ${newToken}`;
          return instance.request(config);
        } catch {
          redirectToSignIn();
        }
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Request failed";
      return Promise.reject(new Error(message));
    }
  );

  return instance;
}

export const apiClient = createApiClient();

/** Axios instance without auth header — for public auth endpoints */
export const publicApiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

publicApiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ResOp<unknown>;
    if (body && typeof body === "object" && "code" in body && "data" in body) {
      response.data = unwrapResOp(body);
    }
    return response;
  },
  (error: AxiosError<ResOp<unknown>>) => {
    const payload = error.response?.data;
    if (payload && typeof payload.code !== "undefined") {
      const code = Number(payload.code);
      const message = payload.message || `API error code ${payload.code}`;
      return Promise.reject(
        new ApiBusinessError(Number.isFinite(code) ? code : -1, message)
      );
    }
    return Promise.reject(
      new Error(error.message || "Request failed")
    );
  }
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig
) {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}