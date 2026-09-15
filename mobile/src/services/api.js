import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.0.2.2:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise = null;

const getAccessToken = () =>
  SecureStore.getItemAsync("accessToken");

const getRefreshToken = () =>
  SecureStore.getItemAsync("refreshToken");

const saveTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
};

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = (async () => {
          const refreshToken = await getRefreshToken();

          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          const {
            accessToken,
            refreshToken: newRefreshToken,
          } = response.data;

          await saveTokens(
            accessToken,
            newRefreshToken
          );

          return accessToken;
        })()
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      await clearTokens();

      return Promise.reject(refreshError);
    }
  }
);

export default api;