import { useSyncExternalStore } from "react";
import type {
  Service,
  BookingEvent,
  ActivityLog,
  DayAvailability,
} from "../types";
import type { SesionDTO } from "../api/dto";
import {
  serviciosRepositorioMock,
  turnosRepositorioMock,
  actividadRepositorioMock,
  disponibilidadRepositorioMock,
} from "../data/index";
import type { ReservarTurnoInput } from "../data/repos/turnos";
import { repositorios } from "../data/index";

export interface AppState {
  inicializado: boolean;
  cargando: boolean;
  error: string | null;
  servicios: Service[];
  turnos: BookingEvent[];
  logs: ActivityLog[];
  equipo: DayAvailability[];
  sesion: SesionDTO | null;
}

const estadoInicial: AppState = {
  inicializado: false,
  cargando: true,
  error: null,
  servicios: [],
  turnos: [],
  logs: [],
  equipo: [],
  sesion: null,
};

let estado: AppState = estadoInicial;
const listeners = new Set<() => void>();

function setEstado(actualizador: (e: AppState) => AppState): void {
  estado = actualizador(estado);
  listeners.forEach((l) => l());
}

export function getEstado(): AppState {
  return estado;
}

export function useStore<T>(selector: (estado: AppState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selector(estado),
  );
}

function logDeTurno(turno: BookingEvent, titulo: string): ActivityLog {
  return {
    id: `log-${turno.id}`,
    timeSpan: "Justo ahora",
    icon: "clock",
    iconColor: "text-indigo-400",
    title: titulo,
    detail: `${turno.clientName} - ${turno.serviceName}`,
  };
}

interface CargaConFallback<T> {
  datos: T;
  conFallback: boolean;
}

async function cargarConFallback<T>(
  origen: () => Promise<T> | T,
  fallback: () => Promise<T>,
): Promise<CargaConFallback<T>> {
  try {
    return { datos: await origen(), conFallback: false };
  } catch {
    return { datos: await fallback(), conFallback: true };
  }
}

export async function iniciarApp(): Promise<void> {
  if (estado.inicializado) return;
  setEstado((e) => ({ ...e, cargando: true }));

  const [servicios, turnos, actividad, equipo] = await Promise.all([
    cargarConFallback(
      () => repositorios.servicios.listarServicios(),
      () => serviciosRepositorioMock.listarServicios(),
    ),
    cargarConFallback(
      () => repositorios.turnos.listarTurnos(),
      () => turnosRepositorioMock.listarTurnos(),
    ),
    cargarConFallback(
      () => repositorios.actividad.listarActividad(),
      () => actividadRepositorioMock.listarActividad(),
    ),
    cargarConFallback(
      () => repositorios.disponibilidad.listarDisponibilidad(),
      () => disponibilidadRepositorioMock.listarDisponibilidad(),
    ),
  ]);

  const conFallback = [servicios, turnos, actividad, equipo].some(
    (r) => r.conFallback,
  );

  setEstado((e) => ({
    ...e,
    inicializado: true,
    cargando: false,
    servicios: servicios.datos,
    turnos: turnos.datos,
    logs: actividad.datos,
    equipo: equipo.datos,
    error: conFallback
      ? "La API del backend no respondió. Mostrando datos de demostración."
      : null,
  }));
}

export async function login(
  email: string,
  password: string,
): Promise<SesionDTO> {
  const sesion = await repositorios.auth.login(email, password);
  setEstado((e) => ({ ...e, sesion }));
  return sesion;
}

export async function logout(): Promise<void> {
  await repositorios.auth.logout();
  setEstado((e) => ({ ...e, sesion: null }));
}

export async function guardarServicio(
  svc: Omit<Service, "id"> & { id?: string },
): Promise<Service> {
  const existe = svc.id && estado.servicios.some((s) => s.id === svc.id);
  if (existe) {
    const actualizado = await repositorios.servicios.actualizarServicio(
      svc as Service,
    );
    setEstado((e) => ({
      ...e,
      servicios: e.servicios.map((s) =>
        s.id === actualizado.id ? { ...actualizado } : s,
      ),
    }));
    return actualizado;
  }
  const creado = await repositorios.servicios.crearServicio(svc);
  setEstado((e) => ({
    ...e,
    servicios: [{ ...creado }, ...e.servicios],
  }));
  return creado;
}

export async function eliminarServicio(id: string): Promise<void> {
  await repositorios.servicios.eliminarServicio(id);
  setEstado((e) => ({
    ...e,
    servicios: e.servicios.filter((s) => s.id !== id),
  }));
}

export async function reservarTurno(
  input: ReservarTurnoInput,
): Promise<BookingEvent> {
  const nuevo = await repositorios.turnos.reservarTurno(input);
  setEstado((e) => ({
    ...e,
    turnos: [nuevo, ...e.turnos],
    logs: [logDeTurno(nuevo, "Nueva Cita"), ...e.logs].slice(0, 8),
  }));
  return nuevo;
}

export async function cancelarTurno(id: string): Promise<void> {
  await repositorios.turnos.cancelarTurno(id);
  setEstado((e) => {
    const turno = e.turnos.find((t) => t.id === id);
    return {
      ...e,
      turnos: e.turnos.filter((t) => t.id !== id),
      logs: turno
        ? [logDeTurno(turno, "Cita Cancelada"), ...e.logs].slice(0, 8)
        : e.logs,
    };
  });
}

export async function guardarDisponibilidad(
  schedule: DayAvailability[],
): Promise<void> {
  const guardado =
    await repositorios.disponibilidad.guardarDisponibilidad(schedule);
  setEstado((e) => ({ ...e, equipo: guardado }));
}

export function agregarLog(log: ActivityLog): void {
  setEstado((e) => ({ ...e, logs: [log, ...e.logs].slice(0, 8) }));
}