import axios, { AxiosRequestConfig, AxiosInstance } from "axios";

const request: AxiosInstance = axios.create({
  // Browser requests stay same-origin. The server-side education BFF owns the
  // upstream URL and bearer credential boundary.
  baseURL: "",
  timeout: 30000,
  withCredentials: true,
});

function toEducationBffPath(url: string | undefined): string | undefined {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) {
    throw new Error("Education API calls must use relative /api paths");
  }
  if (url.startsWith("/api/education/") || url.startsWith("/api/education-auth/")) return url;
  if (url.startsWith("/api/")) return `/api/education/${url.slice("/api/".length)}`;
  return url;
}

request.interceptors.request.use(
  (config) => {
    config.url = toEducationBffPath(config.url);
    if (config.headers) delete config.headers.Authorization;
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => response.data as any,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/api/education-auth/login');
      if (!isLoginRequest) {
        console.warn('Phiên đăng nhập Education không còn hợp lệ');
      }
    }
    return Promise.reject(error);
  },
);

export type RequestOptions = AxiosRequestConfig;
export { request };
