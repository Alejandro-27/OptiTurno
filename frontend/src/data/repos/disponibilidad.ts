import type { DayAvailability } from "../../types";
import { defaultAvailability } from "../../data/index";

export interface DisponibilidadRepositorio {
  listarDisponibilidad(): Promise<DayAvailability[]>;
  guardarDisponibilidad(
    schedule: DayAvailability[],
  ): Promise<DayAvailability[]>;
}

let cacheDisponibilidad: DayAvailability[] | null = null;

const semillaDisponibilidad = (): DayAvailability[] =>
  defaultAvailability.map((d) => ({ ...d }));

export const disponibilidadRepositorioMock: DisponibilidadRepositorio = {
  async listarDisponibilidad() {
    if (!cacheDisponibilidad) cacheDisponibilidad = semillaDisponibilidad();
    return cacheDisponibilidad;
  },
  async guardarDisponibilidad(schedule) {
    cacheDisponibilidad = schedule.map((d) => ({ ...d }));
    return cacheDisponibilidad;
  },
};

export const disponibilidadRepositorioApi: DisponibilidadRepositorio = {
  async listarDisponibilidad() {
    throw new Error(
      "El endpoint de disponibilidad semanal aún no está disponible en el backend.",
    );
  },
  async guardarDisponibilidad() {
    throw new Error(
      "El endpoint para guardar disponibilidad semanal aún no está disponible en el backend.",
    );
  },
};