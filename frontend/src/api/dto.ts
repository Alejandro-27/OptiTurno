import type { EstadoServicio, EstadoTurno, Rol } from "../types/enums";

export interface ServicioDTO {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  estado?: EstadoServicio;
  sucursal_id?: string;
}

export interface ProfesionalDTO {
  id: string;
  especialidad: string;
  sucursal_id?: string;
  usuarios: {
    id: string;
    nombre: string;
    email: string;
  };
}

// Sucursal con nombre del negocio embebido (catálogo público / resolución de sede)
export interface SucursalDTO {
  id: string;
  negocio_id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  negocios: { nombre: string } | null;
}

// Turno con datos de cliente/servicio/profesional embebidos (panel admin)
export interface TurnoAdminDTO {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoTurno;
  created_at: string;
  clientes: {
    id: string;
    nombre: string;
    telefono: string | null;
  } | null;
  servicios: {
    nombre: string;
    precio: number;
    duracion_minutos: number;
  } | null;
  profesionales: {
    id: string;
    especialidad: string;
    sucursal_id: string;
    usuarios: { nombre: string };
  } | null;
}

// Evento de la actividad reciente (compatible con ActivityLog de la UI)
export interface ActivityLogDTO {
  id: string;
  timeSpan: string;
  icon: string;
  iconColor: string;
  title: string;
  detail: string;
}

export interface BloqueOcupadoDTO {
  hora_inicio: string;
  hora_fin: string;
}

export interface DisponibilidadDTO {
  fecha: string;
  jornadaLaboral: { inicio: string; fin: string };
  bloquesOcupados: BloqueOcupadoDTO[];
}

// Ausencia de un profesional (día completo si hora_inicio/fin son null)
export interface AusenciaDTO {
  id: string;
  profesional_id: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string;
  created_at: string;
}

// Payload para registrar una ausencia (fecha_hasta habilita vacaciones por rango)
export interface CrearAusenciaDTO {
  fecha: string;
  fecha_hasta?: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo?: string;
}

export interface ReservarTurnoInputDTO {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}

export interface MisTurnoDTO {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoTurno;
  created_at: string;
  servicios: {
    nombre: string;
    precio: number;
    duracion_minutos: number;
  } | null;
  profesionales: {
    id: string;
    especialidad: string;
    usuarios: { nombre: string };
  } | null;
}

export interface UsuarioSesionDTO {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  telefono?: string | null;
}

// Usuario para el panel de gestión (superadmin)
export interface UsuarioAdminDTO {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string | null;
}

export interface EditarUsuarioInputDTO {
  email?: string;
  rol?: Rol;
}

export interface SesionDTO {
  token: string;
  usuario: UsuarioSesionDTO;
}

export interface LoginUsuarioInput {
  email: string;
  password: string;
}

export interface RegistrarUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol?: Rol;
}

export interface SeederResponseDTO {
  mensaje: string;
  negocioId: string;
  sucursalId: string;
  serviciosInsertados: number;
}
