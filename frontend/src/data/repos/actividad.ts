import type { ActivityLog } from "../../types";
import { initialActivityLogs } from "../../data/index";

export interface ActividadRepositorio {
  listarActividad(): Promise<ActivityLog[]>;
}

let cacheLogs: ActivityLog[] | null = null;

const semillaLogs = (): ActivityLog[] =>
  initialActivityLogs.map((l) => ({ ...l }));

export const actividadRepositorioMock: ActividadRepositorio = {
  async listarActividad() {
    if (!cacheLogs) cacheLogs = semillaLogs();
    return cacheLogs;
  },
};

export const actividadRepositorioApi: ActividadRepositorio = {
  async listarActividad() {
    throw new Error(
      "El endpoint de actividad en tiempo real aún no está disponible en el backend.",
    );
  },
};