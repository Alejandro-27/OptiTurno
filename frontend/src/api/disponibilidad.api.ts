import { apiClient } from "./api.client";
import type { DayAvailability } from "../types";

// La semana laboral de la sucursal con los mismos campos que la UI
export const obtenerDisponibilidadSemanal = async (): Promise<
  DayAvailability[]
> => {
  const { data } = await apiClient.get<DayAvailability[]>(
    "/disponibilidad-semanal",
  );
  return data;
};

// Persiste la programación semanal en el backend
export const guardarDisponibilidadSemanal = async (
  schedule: DayAvailability[],
): Promise<DayAvailability[]> => {
  const { data } = await apiClient.put<{
    message: string;
    schedule: DayAvailability[];
  }>("/disponibilidad-semanal", schedule);
  return data.schedule;
};
