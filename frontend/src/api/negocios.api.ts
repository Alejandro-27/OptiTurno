import { apiClient } from "./api.client";
import type {
  ServicioDTO,
  ProfesionalDTO,
  SucursalDTO,
  SeederResponseDTO,
} from "./dto";

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