import { apiClient } from "./api.client";
import type {
  ServicioDTO,
  ProfesionalDTO,
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

// Disparador de emergencia para poblar la base de datos en plena exposición
export const ejecutarSeederDev = async (): Promise<SeederResponseDTO> => {
  const { data } = await apiClient.post<SeederResponseDTO>("/seed");
  return data;
};