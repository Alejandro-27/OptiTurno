import { apiClient } from "./api.client";
import type { AusenciaDTO, CrearAusenciaDTO } from "./dto";

// Ausencias del profesional vinculado al usuario autenticado (GET /ausencias)
export const listarAusencias = async (): Promise<AusenciaDTO[]> => {
  const { data } = await apiClient.get<AusenciaDTO[]>("/ausencias");
  return data;
};

// Registra una o varias ausencias (POST /ausencias). Devuelve las filas creadas.
export const crearAusencias = async (
  datos: CrearAusenciaDTO,
): Promise<AusenciaDTO[]> => {
  const { data } = await apiClient.post<AusenciaDTO[]>("/ausencias", datos);
  return data;
};

// Elimina una ausencia propia (DELETE /ausencias/:id)
export const eliminarAusencia = async (
  id: string,
): Promise<{ id: string; eliminado: boolean }> => {
  const { data } = await apiClient.delete<{ id: string; eliminado: boolean }>(
    `/ausencias/${id}`,
  );
  return data;
};