import { apiClient } from "./api.client";
import type { ProfesionalDTO } from "./dto";

export interface CrearProfesionalInput {
  sucursal_id: string;
  nombre: string;
  email: string;
  especialidad?: string;
  telefono?: string;
}

// Alta de un profesional: crea cuenta en Auth + perfil + vínculo a la sucursal
export const crearProfesional = async (
  datos: CrearProfesionalInput,
): Promise<ProfesionalDTO> => {
  const { data } = await apiClient.post<ProfesionalDTO>("/profesionales", datos);
  return data;
};