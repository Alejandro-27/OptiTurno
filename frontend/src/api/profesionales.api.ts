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

export interface EditarProfesionalInput {
  nombre?: string;
  especialidad?: string;
  telefono?: string;
}

// Actualización de un profesional (nombre/teléfono en 'usuarios' + especialidad)
export const editarProfesional = async (
  id: string,
  datos: EditarProfesionalInput,
): Promise<ProfesionalDTO> => {
  const { data } = await apiClient.put<ProfesionalDTO>(
    `/profesionales/${id}`,
    datos,
  );
  return data;
};

// Eliminación de un profesional (quita vínculo, turnos y horarios; limpia perfil)
export const eliminarProfesional = async (
  id: string,
): Promise<{ id: string; eliminado: boolean }> => {
  const { data } = await apiClient.delete<{ id: string; eliminado: boolean }>(
    `/profesionales/${id}`,
  );
  return data;
};