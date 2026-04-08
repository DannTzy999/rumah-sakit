"use client";

import axios from "axios";

import { authStore } from "./auth-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/v1` : "http://localhost:4000/v1",
  timeout: 30_000
});

api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err?.config;
    if (status === 401 && original && !original.__isRetry) {
      original.__isRetry = true;
      if (!refreshing) {
        refreshing = (async () => {
          const refreshToken = authStore.getRefreshToken();
          if (!refreshToken) return null;
          try {
            const resp = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken },
              { timeout: 30_000 }
            );
            const newAccess = resp.data?.data?.accessToken ?? resp.data?.accessToken;
            const newRefresh = resp.data?.data?.refreshToken ?? resp.data?.refreshToken;
            if (newAccess && newRefresh) {
              authStore.setTokens(newAccess, newRefresh);
            } else if (newAccess) {
              authStore.setAccessToken(newAccess);
            }
            return newAccess ?? null;
          } catch {
            authStore.clear();
            return null;
          } finally {
            refreshing = null;
          }
        })();
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    throw err;
  }
);

