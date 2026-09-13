import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import {
  getSessionToken,
  setSessionToken,
  setSesionPersistida,
} from "../data/session";
import { ApiError, mensajePorEstado } from "./dto";
import { notificarExterno } from "../contexts/toast";

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints de autenticación: un 401 ahí significa credenciales inválidas,
// no sesión caída (no redirige, el formulario muestra el error inline).
const RUTAS_AUTH = ["/usuarios/login", "/usuarios/registrar"];

// Interceptor de petición: adjunta el token de sesión (Supabase o simulado) en cada petición
apiClient.interceptors.request.use(async (config) => {
  const token = getSessionToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Prioriza el mensaje curado del backend ({ error }), cae en el mapa por status.
function mensajeDeHTTP(error: AxiosError): string {
  const cuerpo = error.response?.data as { error?: unknown } | undefined;
  if (typeof cuerpo?.error === "string" && cuerpo.error.trim()) {
    return cuerpo.error;
  }
  return mensajePorEstado(error.response?.status);
}

// Interceptor de respuesta: normaliza a mensajes humanos y reacciona ante
// sesión caída (401). Regla: nunca llega un texto técnico a la UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const estatus = error.response?.status;
    const url = error.config?.url ?? "";
    const esFlujoAuth = RUTAS_AUTH.some((ruta) => url.includes(ruta));
    const mensaje = mensajeDeHTTP(error);

    // Sesión inválida/expirada (fuera del flujo de login): cerrar sesión,
    // avisar y volver al inicio.
    if (estatus === 401 && !esFlujoAuth) {
      setSessionToken(null);
      setSesionPersistida(null);
      notificarExterno(
        "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.",
        "info",
      );
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
      }
      return Promise.reject(new ApiError(mensaje, estatus));
    }

    // Validaciones (400/422) y conflictos de negocio (4xx): el componente los
    // muestra inline en el formulario/banner. 429 y 5xx/red se notifican por
    // toast de forma global.
    const esGlobal = estatus === undefined || estatus >= 500 || estatus === 429;

    if (esGlobal) {
      notificarExterno(mensaje, estatus === 429 ? "alerta" : "error");
    }

    return Promise.reject(new ApiError(mensaje, estatus));
  },
);
