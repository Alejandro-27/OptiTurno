import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { getSessionToken, setSessionToken } from "../data/session";

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de petición: adjunta el token de sesión (Supabase o simulado) en cada petición
apiClient.interceptors.request.use(async (config) => {
  const token = getSessionToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: ante 401 se descarta la sesión local
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setSessionToken(null);
    }
    return Promise.reject(error);
  },
);