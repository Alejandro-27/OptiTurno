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