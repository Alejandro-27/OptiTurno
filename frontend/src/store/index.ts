import { useSyncExternalStore } from "react";
import type {
  Service,
  BookingEvent,
  ActivityLog,
  DayAvailability,
  Profesional,
} from "../types";
import type {
  MisTurnoDTO,
  SesionDTO,
  UsuarioSesionDTO,
  AusenciaDTO,
  CrearAusenciaDTO,
  UsuarioAdminDTO,
  EditarUsuarioInputDTO,
} from "../api/dto";
import {
  serviciosRepositorioMock,
  turnosRepositorioMock,
  actividadRepositorioMock,
  disponibilidadRepositorioMock,
  profesionalesRepositorioMock,
  ausenciasRepositorioMock,
} from "../data/index";
import type {
  ReservarTurnoInput,
  ReservarTurnoResultado,
} from "../data/repos/turnos";
import type {
  DatosCrearProfesional,
  DatosEditarProfesional,
} from "../data/repos/profesionales";
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
  profesionales: Profesional[];
  sucursalId: string | null;
  sesion: SesionDTO | null;
  misTurnos: MisTurnoDTO[];
  misTurnosCargando: boolean;
  ausencias: AusenciaDTO[];
  usuarios: UsuarioAdminDTO[];
}

const estadoInicial: AppState = {
  inicializado: false,
  cargando: true,
  error: null,
  servicios: [],
  turnos: [],
  logs: [],
  equipo: [],
  profesionales: [],
  sucursalId: null,
  sesion: null,
  misTurnos: [],
  misTurnosCargando: false,
  ausencias: [],
  usuarios: [],
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

const sinCarga = (): { datos: never[]; conFallback: boolean } => ({
  datos: [],
  conFallback: false,
});

// Profesional de la sucursal vinculado al usuario autenticado (si es empleado)
const resolverProfesionalPropio = (
  profesionales: Profesional[],
  sesion: SesionDTO | null,
): Profesional | null => {
  if (!sesion || sesion.usuario.rol !== "empleado") return null;
  return profesionales.find((p) => p.usuarioId === sesion.usuario.id) || null;
};

export async function iniciarApp(): Promise<void> {
  if (estado.inicializado) return;
  setEstado((e) => ({ ...e, cargando: true }));

  // 1. Restaurar la sesión persistida (regla #1: siempre vía el repo de auth/session.ts)
  const sesion = await repositorios.auth.recuperarSesion();
  const esAdmin = Boolean(sesion && sesion.usuario.rol !== "cliente");

  // 2. Resolver la sucursal: la del usuario si hay token, si no la primera del sistema.
  //    Garantiza que el catálogo público y el panel usen datos reales en modo API.
  let sucursalId: string | null = null;
  try {
    const sucursal = await repositorios.sucursales.obtenerSucursalActiva();
    sucursalId = sucursal?.id || null;
  } catch {
    sucursalId = null;
  }

  // 3. Catálogos base: siempre (servicios y profesionales de la sucursal)
  const [servicios, profesionales] = await Promise.all([
    cargarConFallback(
      () => repositorios.servicios.listarServicios(sucursalId || undefined),
      () => serviciosRepositorioMock.listarServicios(),
    ),
    cargarConFallback(
      () =>
        repositorios.profesionales.listarProfesionales(sucursalId || undefined),
      () => profesionalesRepositorioMock.listarProfesionales(),
    ),
  ]);

  // 4. Datos del panel admin: solo se cargan para cuentas de comercio
  const turnos = esAdmin
    ? await cargarConFallback(
        () => repositorios.turnos.listarTurnos(),
        () => turnosRepositorioMock.listarTurnos(),
      )
    : sinCarga();

  const actividad = esAdmin
    ? await cargarConFallback(
        () => repositorios.actividad.listarActividad(),
        () => actividadRepositorioMock.listarActividad(),
      )
    : sinCarga();

  const propioEmpleado = resolverProfesionalPropio(profesionales.datos, sesion);

  const equipo = esAdmin
    ? await cargarConFallback(
        () =>
          propioEmpleado
            ? repositorios.profesionales.obtenerHorarioSemanal(
                propioEmpleado.id,
              )
            : repositorios.disponibilidad.listarDisponibilidad(),
        () => disponibilidadRepositorioMock.listarDisponibilidad(),
      )
    : sinCarga();

  const ausencias = esAdmin
    ? await cargarConFallback(
        () => repositorios.ausencias.listarAusencias(),
        () => ausenciasRepositorioMock.listarAusencias(),
      )
    : sinCarga();

  const conFallback = esAdmin
    ? [servicios, profesionales, turnos, actividad, equipo, ausencias].some(
        (r) => r.conFallback,
      )
    : false;

  setEstado((e) => ({
    ...e,
    inicializado: true,
    cargando: false,
    sucursalId,
    servicios: servicios.datos,
    profesionales: profesionales.datos,
    turnos: turnos.datos,
    logs: actividad.datos,
    equipo: equipo.datos,
    sesion,
    ausencias: ausencias.datos,
    error: conFallback
      ? "La API del backend no respondió. Mostrando datos de prueba."
      : null,
  }));
}

// Recarga los datos del panel tras login/registro de un comercio.
// Re-resuelve la sucursal (puede cambiar) y refresca todo lo del admin.
export async function refrescarDatosAdmin(): Promise<void> {
  const sesion = getEstado().sesion;
  if (!sesion) return;

  let sucursalId: string | null = null;
  try {
    const sucursal = await repositorios.sucursales.obtenerSucursalActiva();
    sucursalId = sucursal?.id || null;
  } catch {
    sucursalId = getEstado().sucursalId;
  }

  let servicios = getEstado().servicios;
  let profesionales = getEstado().profesionales;

  if (sucursalId !== getEstado().sucursalId) {
    const [rServ, rProf] = await Promise.all([
      cargarConFallback(
        () => repositorios.servicios.listarServicios(sucursalId || undefined),
        () => serviciosRepositorioMock.listarServicios(),
      ),
      cargarConFallback(
        () =>
          repositorios.profesionales.listarProfesionales(
            sucursalId || undefined,
          ),
        () => profesionalesRepositorioMock.listarProfesionales(),
      ),
    ]);
    servicios = rServ.datos;
    profesionales = rProf.datos;
  }

  const esAdmin = sesion.usuario.rol !== "cliente";
  let turnos = getEstado().turnos;
  let logs = getEstado().logs;
  let equipo = getEstado().equipo;
  let ausencias = getEstado().ausencias;

  if (esAdmin) {
    const propio = resolverProfesionalPropio(profesionales, sesion);
    const [rTurnos, rAct, rDisp, rAus] = await Promise.all([
      cargarConFallback(
        () => repositorios.turnos.listarTurnos(),
        () => turnosRepositorioMock.listarTurnos(),
      ),
      cargarConFallback(
        () => repositorios.actividad.listarActividad(),
        () => actividadRepositorioMock.listarActividad(),
      ),
      cargarConFallback(
        () =>
          propio
            ? repositorios.profesionales.obtenerHorarioSemanal(propio.id)
            : repositorios.disponibilidad.listarDisponibilidad(),
        () => disponibilidadRepositorioMock.listarDisponibilidad(),
      ),
      cargarConFallback(
        () => repositorios.ausencias.listarAusencias(),
        () => ausenciasRepositorioMock.listarAusencias(),
      ),
    ]);
    turnos = rTurnos.datos;
    logs = rAct.datos;
    equipo = rDisp.datos;
    ausencias = rAus.datos;
  }

  setEstado((e) => ({
    ...e,
    sucursalId,
    servicios,
    profesionales,
    turnos,
    logs,
    equipo,
    ausencias,
  }));
}

export async function login(
  email: string,
  password: string,
): Promise<SesionDTO> {
  const sesion = await repositorios.auth.login(email, password);
  setEstado((e) => ({ ...e, sesion }));
  if (sesion.usuario.rol !== "cliente") {
    await refrescarDatosAdmin().catch(() => undefined);
  }
  return sesion;
}

export async function registrar(
  datos: RegistrarCuentaInput,
): Promise<SesionDTO> {
  const sesion = await repositorios.auth.registrar(datos);
  setEstado((e) => ({ ...e, sesion }));
  if (sesion.usuario.rol !== "cliente") {
    await refrescarDatosAdmin().catch(() => undefined);
  }
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
export async function cancelarTurnoCliente(
  id: string,
  motivo?: string,
): Promise<void> {
  const actualizado = await repositorios.turnos.cancelarTurnoCliente(
    id,
    motivo,
  );
  setEstado((e) => ({
    ...e,
    misTurnos: e.misTurnos.map((t) => (t.id === id ? actualizado : t)),
  }));
}

// Reagendamiento de un turno propio del cliente
export async function reagendarTurnoCliente(
  id: string,
  nuevaFecha: string,
  nuevaHoraInicio: string,
): Promise<MisTurnoDTO> {
  const turnoAnterior = await repositorios.turnos.reagendarTurnoCliente(
    id,
    nuevaFecha,
    nuevaHoraInicio,
  );
  setEstado((e) => ({
    ...e,
    misTurnos: e.misTurnos.map((t) =>
      t.id === id ? { ...turnoAnterior, estado: "reagendado" as const } : t,
    ),
  }));
  return turnoAnterior;
}

// Actualización del perfil propio (nombre/teléfono)
export async function actualizarPerfil(datos: {
  nombre?: string;
  telefono?: string;
}): Promise<UsuarioSesionDTO> {
  const perfil = await repositorios.auth.actualizarPerfil(datos);
  setEstado((e) =>
    e.sesion
      ? {
          ...e,
          sesion: { ...e.sesion, usuario: { ...e.sesion.usuario, ...perfil } },
        }
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
  const creado = await repositorios.servicios.crearServicio(
    {
      ...svc,
      sucursalId: svc.sucursalId || getEstado().sucursalId || undefined,
    },
    getEstado().sucursalId || undefined,
  );
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
  const profesionales =
    await repositorios.profesionales.listarProfesionales(sucursalId);
  return profesionales;
}

// Alta de un profesional en la sucursal activa (pestaña Equipo)
export async function crearProfesional(
  datos: DatosCrearProfesional,
): Promise<Profesional> {
  const sucursalId = getEstado().sucursalId;
  if (!sucursalId) {
    throw new Error(
      "Aún no hay una sucursal activa. Crea o selecciona una sucursal primero.",
    );
  }
  const creado = await repositorios.profesionales.crearProfesional(
    datos,
    sucursalId,
  );
  setEstado((e) => ({
    ...e,
    profesionales: [...e.profesionales, creado],
  }));
  return creado;
}

// Actualización de un profesional existente (pestaña Equipo)
export async function editarProfesional(
  id: string,
  datos: DatosEditarProfesional,
): Promise<Profesional> {
  const actualizado = await repositorios.profesionales.editarProfesional(
    id,
    datos,
  );
  setEstado((e) => ({
    ...e,
    profesionales: e.profesionales.map((p) =>
      p.id === id ? { ...actualizado } : p,
    ),
  }));
  return actualizado;
}

// Eliminación de un profesional (pestaña Equipo)
export async function eliminarProfesional(id: string): Promise<void> {
  await repositorios.profesionales.eliminarProfesional(id);
  setEstado((e) => ({
    ...e,
    profesionales: e.profesionales.filter((p) => p.id !== id),
  }));
}

// Ausencias: consulta, alta y baja (panel empleado)
export async function cargarAusencias(): Promise<AusenciaDTO[]> {
  const ausencias = await repositorios.ausencias.listarAusencias();
  setEstado((e) => ({ ...e, ausencias }));
  return ausencias;
}

export async function crearAusencia(
  datos: CrearAusenciaDTO,
): Promise<AusenciaDTO[]> {
  const creadas = await repositorios.ausencias.crearAusencias(datos);
  setEstado((e) => ({
    ...e,
    ausencias: [...e.ausencias, ...creadas].sort((a, b) =>
      a.fecha.localeCompare(b.fecha),
    ),
  }));
  return creadas;
}

export async function eliminarAusencia(id: string): Promise<void> {
  await repositorios.ausencias.eliminarAusencia(id);
  setEstado((e) => ({
    ...e,
    ausencias: e.ausencias.filter((a) => a.id !== id),
  }));
}

// Semana laboral del empleado autenticado (su propio horario)
export async function cargarHorarioEmpleado(): Promise<void> {
  const estadoActual = getEstado();
  const propio = resolverProfesionalPropio(
    estadoActual.profesionales,
    estadoActual.sesion,
  );
  if (!propio) return;
  const horario = await repositorios.profesionales.obtenerHorarioSemanal(
    propio.id,
  );
  setEstado((e) => ({ ...e, equipo: horario }));
}

export async function guardarHorarioEmpleado(
  schedule: DayAvailability[],
): Promise<void> {
  const estadoActual = getEstado();
  const propio = resolverProfesionalPropio(
    estadoActual.profesionales,
    estadoActual.sesion,
  );
  if (!propio) throw new Error("No se encontró tu perfil de profesional.");
  const guardado = await repositorios.profesionales.guardarHorarioSemanal(
    propio.id,
    schedule,
  );
  setEstado((e) => ({ ...e, equipo: guardado }));
}

// Gestión de usuarios (panel superadmin)
export async function cargarUsuarios(): Promise<UsuarioAdminDTO[]> {
  const usuarios = await repositorios.usuarios.listarUsuarios();
  setEstado((e) => ({ ...e, usuarios }));
  return usuarios;
}

export async function editarUsuario(
  id: string,
  datos: EditarUsuarioInputDTO,
): Promise<UsuarioAdminDTO> {
  const actualizado = await repositorios.usuarios.editarUsuario(id, datos);
  setEstado((e) => ({
    ...e,
    usuarios: e.usuarios.map((u) => (u.id === id ? actualizado : u)),
  }));
  return actualizado;
}
