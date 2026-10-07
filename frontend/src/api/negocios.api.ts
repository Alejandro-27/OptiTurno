import { apiClient } from "./api.client";
import type {
  ServicioDTO,
  ProfesionalDTO,
  SucursalDTO,
  SeederResponseDTO,
  OnboardingNegocioInput,
  OnboardingNegocioResultado,
  MiNegocioDTO,
  NegocioAdminDTO,
  SucursalAdminDTO,
  CrearNegocioInputDTO,
  ActualizarNegocioInputDTO,
  CrearSucursalInputDTO,
  ActualizarSucursalInputDTO,
} from "./dto";
import { ApiError } from "./dto";

// Trae los servicios disponibles de una sucursal específica
export const obtenerServicios = async (
  sucursalId: string,
): Promise<ServicioDTO[]> => {
  const { data } = await apiClient.get<ServicioDTO[]>(
    `/sucursales/${sucursalId}/servicios`,
  );
  return data;
};

// Trae el personal (profesionales) de una sucursal
export const obtenerProfesionales = async (
  sucursalId: string,
): Promise<ProfesionalDTO[]> => {
  const { data } = await apiClient.get<ProfesionalDTO[]>(
    `/sucursales/${sucursalId}/profesionales`,
  );
  return data;
};

// Lista todas las sucursales (catálogo público)
export const obtenerSucursales = async (): Promise<SucursalDTO[]> => {
  const { data } = await apiClient.get<SucursalDTO[]>("/sucursales");
  return data;
};

// Sucursal del usuario autenticado (admin: la de su negocio; cliente: la primera)
export const obtenerMiSucursal = async (): Promise<SucursalDTO> => {
  const { data } = await apiClient.get<SucursalDTO>("/sucursales/mi-sucursal");
  return data;
};

// Crea un servicio en la sucursal activa
export const crearServicio = async (
  sucursalId: string,
  svc: Omit<ServicioDTO, "id">,
): Promise<ServicioDTO> => {
  const { data } = await apiClient.post<ServicioDTO>("/servicios", {
    ...svc,
    sucursal_id: sucursalId,
  });
  return data;
};

// Actualiza los campos editables de un servicio (incluye Activo/Pausado)
export const actualizarServicio = async (
  id: string,
  campos: Partial<Omit<ServicioDTO, "id">>,
): Promise<ServicioDTO> => {
  const { data } = await apiClient.put<ServicioDTO>(`/servicios/${id}`, campos);
  return data;
};

// Elimina un servicio (409 si tiene turnos asociados)
export const eliminarServicio = async (id: string): Promise<void> => {
  await apiClient.delete(`/servicios/${id}`);
};

// Disparador de emergencia para poblar la base de datos en plena exposición
export const ejecutarSeederDev = async (): Promise<SeederResponseDTO> => {
  const { data } = await apiClient.post<SeederResponseDTO>("/seed");
  return data;
};

// --- Onboarding ---

// Crea el negocio + sucursal inicial y vincula al admin autenticado
export const crearNegocioOnboarding = async (
  input: OnboardingNegocioInput,
): Promise<OnboardingNegocioResultado> => {
  const { data } = await apiClient.post<OnboardingNegocioResultado>(
    "/onboarding/negocio",
    input,
  );
  return data;
};

// Consulta si el admin autenticado ya tiene negocio configurado
export const obtenerMiNegocio = async (): Promise<MiNegocioDTO | null> => {
  try {
    const { data } = await apiClient.get<MiNegocioDTO>(
      "/onboarding/mi-negocio",
    );
    return data;
  } catch (error) {
    // 404 = no tiene negocio (requiere onboarding)
    if (error instanceof ApiError && error.estado === 404) return null;
    throw error;
  }
};

// Lista usuarios de un negocio (superadmin o admin_negocio del negocio)
export const listarUsuariosNegocio = async (
  negocioId: string,
): Promise<
  Array<{ id: string; nombre: string; email: string; rol: string }>
> => {
  const { data } = await apiClient.get<
    Array<{ id: string; nombre: string; email: string; rol: string }>
  >(`/negocios/${negocioId}/usuarios`);
  return data;
};

// --- CRUD superadmin ---

// Lista todos los negocios con sus sucursales (solo superadmin)
export const listarNegocios = async (): Promise<NegocioAdminDTO[]> => {
  const { data } = await apiClient.get<NegocioAdminDTO[]>("/negocios");
  return data;
};

// Crea un negocio nuevo (solo superadmin)
export const crearNegocio = async (
  input: CrearNegocioInputDTO,
): Promise<NegocioAdminDTO> => {
  const { data } = await apiClient.post<NegocioAdminDTO>("/negocios", input);
  return data;
};

// Actualiza nombre/slug de un negocio (solo superadmin)
export const actualizarNegocio = async (
  id: string,
  input: ActualizarNegocioInputDTO,
): Promise<NegocioAdminDTO> => {
  const { data } = await apiClient.put<NegocioAdminDTO>(
    `/negocios/${id}`,
    input,
  );
  return data;
};

// Elimina (soft delete) un negocio y sus sucursales (solo superadmin)
export const eliminarNegocio = async (id: string): Promise<void> => {
  await apiClient.delete(`/negocios/${id}`);
};

// Crea una sucursal en un negocio (solo superadmin)
export const crearSucursal = async (
  input: CrearSucursalInputDTO,
): Promise<SucursalAdminDTO> => {
  const { data } = await apiClient.post<SucursalAdminDTO>("/sucursales", input);
  return data;
};

// Actualiza una sucursal (solo superadmin)
export const actualizarSucursal = async (
  id: string,
  input: ActualizarSucursalInputDTO,
): Promise<SucursalAdminDTO> => {
  const { data } = await apiClient.put<SucursalAdminDTO>(
    `/sucursales/${id}`,
    input,
  );
  return data;
};

// Elimina (soft delete) una sucursal (solo superadmin)
export const eliminarSucursal = async (id: string): Promise<void> => {
  await apiClient.delete(`/sucursales/${id}`);
};
