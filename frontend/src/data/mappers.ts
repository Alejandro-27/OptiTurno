import type { Service, BookingEvent, Profesional, ActivityLog } from "../types";
import type { Rol } from "../types/enums";
import type {
  ServicioDTO,
  UsuarioSesionDTO,
  ProfesionalDTO,
  TurnoAdminDTO,
  ActivityLogDTO,
} from "../api/dto";

const CATEGORIA_ICONOS: Record<string, string> = {
  estética: "scissors",
  corte: "scissors",
  barba: "face",
  piel: "spa",
  facial: "spa",
  tratamiento: "spa",
  color: "brush",
  mech: "brush",
  manicura: "brush",
  pedicura: "brush",
  spa: "spa",
};

export function iconoDesdeNombre(nombre: string): string {
  const lower = nombre.toLowerCase();
  for (const [clave, icono] of Object.entries(CATEGORIA_ICONOS)) {
    if (lower.includes(clave)) return icono;
  }
  return "scissors";
}

const PALETA: Array<BookingEvent["color"]> = [
  "primary",
  "secondary",
  "tertiary",
];

export function colorDesdeId(id: string): BookingEvent["color"] {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PALETA[hash % PALETA.length];
}

export function servicioDtoToUI(dto: ServicioDTO): Service {
  return {
    id: dto.id,
    name: dto.nombre,
    category: dto.descripcion ? dto.descripcion : "Sin categoría",
    price: dto.precio,
    duration: dto.duracion_minutos,
    status: dto.estado === "Pausado" ? "Pausado" : "Activo",
    icon: iconoDesdeNombre(dto.nombre),
    sucursalId: dto.sucursal_id,
  };
}

export function servicioUIToDto(svc: Service): Omit<ServicioDTO, "id"> {
  return {
    nombre: svc.name,
    descripcion: svc.category,
    precio: svc.price,
    duracion_minutos: svc.duration,
    estado: svc.status,
  };
}

export function profesionalDtoToUI(dto: ProfesionalDTO): Profesional {
  return {
    id: dto.id,
    nombre: dto.usuarios.nombre,
    especialidad: dto.especialidad,
    usuarioId: dto.usuarios.id,
    email: dto.usuarios.email,
  };
}

// Evento del calendario admin desde el turno de la API
export function turnoAdminDtoToUI(dto: TurnoAdminDTO): BookingEvent {
  const profesionalId = dto.profesionales?.id || "sin-profesional";
  const nombreServicio = dto.servicios?.nombre || "Sin servicio";
  return {
    id: dto.id,
    clientName: dto.clientes?.nombre || "Cliente",
    serviceName: nombreServicio,
    timeStart: dto.hora_inicio.slice(0, 5),
    timeEnd: dto.hora_fin.slice(0, 5),
    columnId: profesionalId,
    color: colorDesdeId(profesionalId),
    icon: iconoDesdeNombre(nombreServicio),
  };
}

// El backend ya entrega la forma final de los logs de actividad
export function activityLogDtoToUI(dto: ActivityLogDTO): ActivityLog {
  return { ...dto };
}

export function usuarioDTODesdeSesion(usuario: {
  id?: string;
  email?: string;
  rol?: Rol;
  nombre?: string;
}): UsuarioSesionDTO {
  return {
    id: usuario.id || "usuario-invitado",
    email: usuario.email || "",
    nombre: usuario.nombre || "Usuario invitado",
    rol: usuario.rol || "superadmin",
  };
}
