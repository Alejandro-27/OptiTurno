import { useSyncExternalStore } from "react";
import type {
  Service,
  BookingEvent,
  ActivityLog,
  DayAvailability,
  Profesional,
} from "../types";
import type { MisTurnoDTO, SesionDTO, UsuarioSesionDTO } from "../api/dto";
import {
  serviciosRepositorioMock,
  turnosRepositorioMock,
  actividadRepositorioMock,
  disponibilidadRepositorioMock,
} from "../data/index";
import type { ReservarTurnoInput, ReservarTurnoResultado } from "../data/repos/turnos";
import type { RegistrarCuentaInput } from "../data/repos/auth";
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
  misTurnos: MisTurnoDTO[];
  misTurnosCargando: boolean;
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
  misTurnos: [],
  misTurnosCargando: false,
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

  // Restaura la sesión persistida (si existe) para volver a la vista por rol
  const sesion = await repositorios.auth.recuperarSesion();

  setEstado((e) => ({
    ...e,
    inicializado: true,
    cargando: false,
    servicios: servicios.datos,
    turnos: turnos.datos,
    logs: actividad.datos,
    equipo: equipo.datos,
    sesion,
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

export async function registrar(
  datos: RegistrarCuentaInput,
): Promise<SesionDTO> {
  const sesion = await repositorios.auth.registrar(datos);
  setEstado((e) => ({ ...e, sesion }));
  return sesion;
}

export async function logout(): Promise<void> {
  await repositorios.auth.logout();
  setEstado((e) => ({ ...e, sesion: null, misTurnos: [] }));
}

// Turnos propios del cliente (GET /turnos/mios)
export async function cargarMisTurnos(): Promise<MisTurnoDTO[]> {
  setEstado((e) => ({ ...e, misTurnosCargando: true }));
  try {
    const turnos = await repositorios.turnos.listarMisTurnos(
      getEstado().sesion?.usuario.id || "",
    );
    setEstado((e) => ({ ...e, misTurnos: turnos, misTurnosCargando: false }));
    return turnos;
  } catch (err) {
    setEstado((e) => ({ ...e, misTurnosCargando: false }));
    throw err;
  }
}

// Cancelación de un turno propio del cliente
export async function cancelarTurnoCliente(id: string): Promise<void> {
  const actualizado = await repositorios.turnos.cancelarTurnoCliente(id);
  setEstado((e) => ({
    ...e,
    misTurnos: e.misTurnos.map((t) => (t.id === id ? actualizado : t)),
  }));
}

// Actualización del perfil propio (nombre/teléfono)
export async function actualizarPerfil(datos: {
  nombre?: string;
  telefono?: string;
}): Promise<UsuarioSesionDTO> {
  const perfil = await repositorios.auth.actualizarPerfil(datos);
  setEstado((e) =>
    e.sesion
      ? { ...e, sesion: { ...e.sesion, usuario: { ...e.sesion.usuario, ...perfil } } }
      : e,
  );
  return perfil;
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
): Promise<ReservarTurnoResultado> {
  const resultado = await repositorios.turnos.reservarTurno(input);
  setEstado((e) => ({
    ...e,
    turnos: [resultado.turno, ...e.turnos],
    logs: [logDeTurno(resultado.turno, "Nueva Cita"), ...e.logs].slice(0, 8),
  }));
  return resultado;
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

export async function listarProfesionales(
  sucursalId?: string,
): Promise<Profesional[]> {
  const profesionales = await repositorios.profesionales.listarProfesionales(
    sucursalId,
  );
  return profesionales;
}

export async function confirmarPago(
  transaccionId: string,
): Promise<{ success: boolean; message: string }> {
  const resultado = await repositorios.pagos.confirmarPago(transaccionId);
  return resultado;
}