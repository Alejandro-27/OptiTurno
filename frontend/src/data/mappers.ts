import type { Service, BookingEvent, Profesional } from "../types";
import type { ServicioDTO, UsuarioSesionDTO, ProfesionalDTO } from "../api/dto";

const CATEGORIA_ICONOS: Record<string, string> = {
  "estética": "scissors",
  "corte": "scissors",
  "barba": "face",
  "piel": "spa",
  "facial": "spa",
  "tratamiento": "spa",
  "color": "brush",
  "mech": "brush",
  "manicura": "brush",
  "pedicura": "brush",
  "spa": "spa",
};

export function iconoDesdeNombre(nombre: string): string {
  const lower = nombre.toLowerCase();
  for (const [clave, icono] of Object.entries(CATEGORIA_ICONOS)) {
    if (lower.includes(clave)) return icono;
  }
  return "scissors";
}

const PALETA: Array<BookingEvent["color"]> = ["primary", "secondary", "tertiary"];

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
  };
}

export function usuarioDTODesdeSesion(usuario: {
  id?: string;
  email?: string;
  rol?: string;
  nombre?: string;
}): UsuarioSesionDTO {
  return {
    id: usuario.id || "usuario-demo",
    email: usuario.email || "",
    nombre: usuario.nombre || "Usuario Demo",
    rol: usuario.rol || "superadmin",
  };
}