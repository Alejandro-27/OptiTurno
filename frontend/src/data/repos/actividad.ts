import type { ActivityLog } from "../../types";
import { initialActivityLogs } from "../../data/index";
import { obtenerActividad } from "../../api/actividad.api";
import { activityLogDtoToUI } from "../mappers";

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
    const dtos = await obtenerActividad();
    return dtos.map(activityLogDtoToUI);
  },
};