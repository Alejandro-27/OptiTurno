import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Middleware de Axios (Interceptor) para adjuntar el token de Supabase en cada petición
apiClient.interceptors.request.use(async (config) => {
  // Aquí recuperaramos la sesión de Supabase en el frontend
  // const { data: { session } } = await supabase.auth.getSession();
  // const token = session?.access_token;

  // Por ahora, simulamos un token para pruebas de desarrollo
  const token = "TOKEN_SIMULADO_SUPERADMIN";

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
