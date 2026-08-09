import { apiClient } from "./api.client";
import type {
  LoginUsuarioInput,
  RegistrarUsuarioInput,
  SesionDTO,
  UsuarioSesionDTO,
} from "./dto";

// Inicia sesión (clientes PWA y comercios): devuelve el token JWT + perfil espejo
export const loginUsuario = async (
  datos: LoginUsuarioInput,
): Promise<SesionDTO> => {
  const { data } = await apiClient.post<SesionDTO>("/usuarios/login", datos);
  return data;
};

// Registra la cuenta (Supabase Auth + perfil espejo en 'usuarios' con rol)
export const registrarUsuario = async (
  datos: RegistrarUsuarioInput,
): Promise<UsuarioSesionDTO> => {
  const { data } = await apiClient.post<UsuarioSesionDTO>(
    "/usuarios/registrar",
    datos,
  );
  return data;
};

// Perfil del usuario autenticado (GET /usuarios/me)
export const obtenerPerfil = async (): Promise<UsuarioSesionDTO> => {
  const { data } = await apiClient.get<UsuarioSesionDTO>("/usuarios/me");
  return data;
};

// Actualiza nombre/teléfono del perfil propio (PUT /usuarios/me)
export const actualizarPerfil = async (datos: {
  nombre?: string;
  telefono?: string;
}): Promise<UsuarioSesionDTO> => {
  const { data } = await apiClient.put<UsuarioSesionDTO>("/usuarios/me", datos);
  return data;
};