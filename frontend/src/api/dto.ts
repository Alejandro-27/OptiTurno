export interface ServicioDTO {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  estado?: string;
}

export interface ProfesionalDTO {
  id: string;
  especialidad: string;
  usuarios: {
    id: string;
    nombre: string;
    email: string;
  };
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
  estado: string;
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
  rol: string;
  telefono?: string | null;
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
  rol?: string;
}

export interface SeederResponseDTO {
  mensaje: string;
  negocioId: string;
  sucursalId: string;
  serviciosInsertados: number;
}