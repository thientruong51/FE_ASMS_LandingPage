import axios, { AxiosError, type AxiosInstance } from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type LoginPayload = {
  email: string;
  password: string;
};

export type RefreshPayload = {
  refreshToken: string;
};

export type AuthResponse = {
  data: any;
  success: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
  errorMessage?: string | null;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function saveTokens(accessToken: string | null, refreshToken: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);

  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const authClient: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(newToken: string | null) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

authClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    if (status === 401 && !originalRequest.headers!["x-retried-with-refresh"]) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (!newToken) return reject(error);
            originalRequest.headers!["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers!["x-retried-with-refresh"] = "1";
            resolve(authClient.request(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await refreshTokenApi({ refreshToken });
        const newAccess = refreshRes.accessToken ?? null;
        const newRefresh = refreshRes.refreshToken ?? null;

        saveTokens(newAccess, newRefresh);

        processQueue(newAccess);

        originalRequest.headers!["Authorization"] = newAccess ? `Bearer ${newAccess}` : "";
        originalRequest.headers!["x-retried-with-refresh"] = "1";
        return authClient.request(originalRequest);
      } catch (refreshErr) {
        processQueue(null);
        clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export async function customerLogin(payload: LoginPayload): Promise<AuthResponse> {
  const url = `/api/Authentication/customer-login`;
  const res = await axios.post(`${BASE}${url}`, payload);
  const data: AuthResponse = res.data ?? {};
  if (data.accessToken || data.refreshToken) {
    saveTokens(data.accessToken ?? null, data.refreshToken ?? null);
  }
  return data;
}

export async function employeeLogin(payload: LoginPayload): Promise<AuthResponse> {
  const url = `/api/Authentication/employee-login`;
  const res = await axios.post(`${BASE}${url}`, payload);
  const data: AuthResponse = res.data ?? {};
  if (data.accessToken || data.refreshToken) {
    saveTokens(data.accessToken ?? null, data.refreshToken ?? null);
  }
  return data;
}

export async function refreshTokenApi(payload: RefreshPayload): Promise<AuthResponse> {
  const url = `/api/Authentication/refresh-token`;
  const res = await axios.post(`${BASE}${url}`, payload);
  const data: AuthResponse = res.data ?? {};
  return data;
}

export async function logoutApi(): Promise<void> {
  const url = `/api/Authentication/logout`;
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await authClient.post(url, { refreshToken });
  } else {
    await authClient.post(url);
  }
  clearTokens();
}

export const api = {
  client: authClient,
  customerLogin,
  employeeLogin,
  refreshTokenApi,
  logoutApi,
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};
