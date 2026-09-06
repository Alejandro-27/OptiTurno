import { apiClient } from "./api.client";
import type { ActivityLogDTO } from "./dto";

// Actividad reciente de la sucursal del admin
export const obtenerActividad = async (): Promise<ActivityLogDTO[]> => {
  const { data } = await apiClient.get<ActivityLogDTO[]>("/actividad");
  return data;
};