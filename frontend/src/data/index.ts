import { usarMocks } from "../config/env";
import {
  serviciosRepositorioMock,
  serviciosRepositorioApi,
} from "./repos/servicios";
import { turnosRepositorioMock, turnosRepositorioApi } from "./repos/turnos";
import {
  actividadRepositorioMock,
  actividadRepositorioApi,
} from "./repos/actividad";
import {
  disponibilidadRepositorioMock,
  disponibilidadRepositorioApi,
} from "./repos/disponibilidad";
import { authRepositorioMock, authRepositorioApi } from "./repos/auth";
import {
  profesionalesRepositorioMock,
  profesionalesRepositorioApi,
} from "./repos/profesionales";
import {
  sucursalesRepositorioMock,
  sucursalesRepositorioApi,
} from "./repos/sucursales";
import {
  ausenciasRepositorioMock,
  ausenciasRepositorioApi,
} from "./repos/ausencias";

export const repositorios = usarMocks()
  ? {
      servicios: serviciosRepositorioMock,
      turnos: turnosRepositorioMock,
      actividad: actividadRepositorioMock,
      disponibilidad: disponibilidadRepositorioMock,
      auth: authRepositorioMock,
      profesionales: profesionalesRepositorioMock,
      sucursales: sucursalesRepositorioMock,
      ausencias: ausenciasRepositorioMock,
    }
  : {
      servicios: serviciosRepositorioApi,
      turnos: turnosRepositorioApi,
      actividad: actividadRepositorioApi,
      disponibilidad: disponibilidadRepositorioApi,
      auth: authRepositorioApi,
      profesionales: profesionalesRepositorioApi,
      sucursales: sucursalesRepositorioApi,
      ausencias: ausenciasRepositorioApi,
    };

export {
  serviciosRepositorioMock,
  turnosRepositorioMock,
  actividadRepositorioMock,
  disponibilidadRepositorioMock,
  profesionalesRepositorioMock,
  sucursalesRepositorioMock,
  ausenciasRepositorioMock,
};
export * from "../data";
export * from "./session";
export * from "./mappers";