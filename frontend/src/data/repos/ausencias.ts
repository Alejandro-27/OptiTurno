import type { AusenciaDTO, CrearAusenciaDTO } from "../../api/dto";
import {
  listarAusencias,
  crearAusencias,
  eliminarAusencia as eliminarAusenciaApi,
} from "../../api/ausencias.api";

export interface AusenciasRepositorio {
  listarAusencias(): Promise<AusenciaDTO[]>;
  crearAusencias(datos: CrearAusenciaDTO): Promise<AusenciaDTO[]>;
  eliminarAusencia(id: string): Promise<void>;
}

// Ausencias en memoria (modo demo). Accesible desde otros mocks (ej. disponibilidad).
let cacheAusencias: AusenciaDTO[] | null = null;

export const obtenerAusenciasMock = (): AusenciaDTO[] => cacheAusencias || [];

export const ausenciasRepositorioMock: AusenciasRepositorio = {
  async listarAusencias() {
    if (!cacheAusencias) cacheAusencias = [];
    return cacheAusencias;
  },
  async crearAusencias(datos) {
    if (!cacheAusencias) cacheAusencias = [];

    const inicio = new Date(`${datos.fecha}T00:00:00Z`);
    const fin = datos.fecha_hasta
      ? new Date(`${datos.fecha_hasta}T00:00:00Z`)
      : new Date(inicio);
    if (fin < inicio) {
      throw new Error("La fecha final no puede ser anterior a la inicial.");
    }

    const creadas: AusenciaDTO[] = [];
    const actual = new Date(inicio);
    while (actual <= fin) {
      const creada: AusenciaDTO = {
        id: `aus-${Math.random().toString(36).slice(2, 10)}`,
        profesional_id: "carlos",
        fecha: actual.toISOString().slice(0, 10),
        hora_inicio: datos.hora_inicio || null,
        hora_fin: datos.hora_fin || null,
        motivo: datos.motivo || "Ausencia personal",
        created_at: new Date().toISOString(),
      };
      cacheAusencias.push(creada);
      creadas.push(creada);
      actual.setUTCDate(actual.getUTCDate() + 1);
    }
    return creadas;
  },
  async eliminarAusencia(id) {
    if (!cacheAusencias) cacheAusencias = [];
    const indice = cacheAusencias.findIndex((a) => a.id === id);
    if (indice === -1) throw new Error("La ausencia no existe.");
    cacheAusencias.splice(indice, 1);
  },
};

export const ausenciasRepositorioApi: AusenciasRepositorio = {
  async listarAusencias() {
    return listarAusencias();
  },
  async crearAusencias(datos) {
    return crearAusencias(datos);
  },
  async eliminarAusencia(id) {
    await eliminarAusenciaApi(id);
  },
};