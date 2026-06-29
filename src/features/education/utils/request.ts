import axios, { AxiosRequestConfig, AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // Tăng timeout lên 30s
  withCredentials: true,
});

// Interceptor gắn token
request.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý response
request.interceptors.response.use(
  (response) => response.data as any,
  (error) => {
    // CHỈ LOGOUT KHI API TRẢ VỀ 401 VÀ ĐÃ THỬ HẾT CÁCH
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      if (!isLoginRequest) {
        console.error('⚠️ Phiên đăng nhập hết hạn');
        // KHÔNG TỰ ĐỘNG LOGOUT - để user tự quyết định
        // Nếu muốn tự động logout, bỏ comment dòng dưới:
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('user');
        // window.location.href = '/education/dashboard/admin/signin';
      }
    }
    return Promise.reject(error);
  },
);

export type RequestOptions = AxiosRequestConfig;
export { request };
