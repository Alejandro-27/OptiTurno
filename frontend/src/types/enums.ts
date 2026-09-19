export type Rol = "cliente" | "admin_negocio" | "superadmin" | "empleado";

export type EstadoTurno =
  | "pendiente_pago"
  | "confirmado"
  | "cancelado"
  | "reagendado"
  | "pendiente_reagendamiento"
  | "completado"
  | "no_asistio";

export type EstadoServicio = "Activo" | "Pausado";

export const ROLES_SISTEMA: readonly Rol[] = [
  "cliente",
  "admin_negocio",
  "superadmin",
  "empleado",
];

export const ES_UN_ROL = (v: string): v is Rol =>
  (ROLES_SISTEMA as readonly string[]).includes(v);

export const ESTADOS_TURNO: readonly EstadoTurno[] = [
  "pendiente_pago",
  "confirmado",
  "cancelado",
  "reagendado",
  "pendiente_reagendamiento",
  "completado",
  "no_asistio",
];
