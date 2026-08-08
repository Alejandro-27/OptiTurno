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

export const repositorios = usarMocks()
  ? {
      servicios: serviciosRepositorioMock,
      turnos: turnosRepositorioMock,
      actividad: actividadRepositorioMock,
      disponibilidad: disponibilidadRepositorioMock,
      auth: authRepositorioMock,
    }
  : {
      servicios: serviciosRepositorioApi,
      turnos: turnosRepositorioApi,
      actividad: actividadRepositorioApi,
      disponibilidad: disponibilidadRepositorioApi,
      auth: authRepositorioApi,
    };

export {
  serviciosRepositorioMock,
  turnosRepositorioMock,
  actividadRepositorioMock,
  disponibilidadRepositorioMock,
};
export * from "../data";
export * from "./session";
export * from "./mappers";