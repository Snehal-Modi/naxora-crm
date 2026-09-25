import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TokenResponse, UserProfile } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to outgoing requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("naxora_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Refresh token interceptor on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("naxora_refresh_token") : null;
        const res = await axios.post<TokenResponse>(
          `${BASE_URL}/auth/refresh`,
          storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
          { withCredentials: true }
        );
        
        const { access_token, refresh_token } = res.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("naxora_access_token", access_token);
          if (refresh_token) {
            localStorage.setItem("naxora_refresh_token", refresh_token);
          }
        }
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("naxora_access_token");
          localStorage.removeItem("naxora_refresh_token");
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign("/login");
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/login", { email, password });
    return res.data;
  },
  logout: async (): Promise<void> => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("naxora_refresh_token") : null;
    try {
      await apiClient.post("/auth/logout", { refresh_token: refreshToken });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("naxora_access_token");
        localStorage.removeItem("naxora_refresh_token");
      }
    }
  },
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>("/auth/me");
    return res.data;
  },
  getHealth: async () => {
    const res = await apiClient.get("/health");
    return res.data;
  },
};

