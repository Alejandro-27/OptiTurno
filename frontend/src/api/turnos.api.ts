import { apiClient } from "./api.client";
import type {
  DisponibilidadDTO,
  MisTurnoDTO,
  ReservarTurnoInputDTO,
  TurnoAdminDTO,
} from "./dto";
import type { EstadoTurno } from "../types/enums";

export const obtenerDisponibilidad = async (
  profesionalId: string,
  fecha: string,
): Promise<DisponibilidadDTO> => {
  const { data } = await apiClient.get<DisponibilidadDTO>(
    "/turnos/disponibilidad",
    {
      params: { profesional_id: profesionalId, fecha },
    },
  );
  return data;
};

export interface TurnoReservadoDTO {
  id: string;
  estado: EstadoTurno;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface ReservarTurnoResponseDTO {
  message: string;
  turno: TurnoReservadoDTO;
}

export const reservarTurno = async (
  datosReserva: ReservarTurnoInputDTO,
): Promise<ReservarTurnoResponseDTO> => {
  const { data } = await apiClient.post<ReservarTurnoResponseDTO>(
    "/turnos/reservar",
    datosReserva,
  );
  return data;
};

export const obtenerMisTurnos = async (): Promise<MisTurnoDTO[]> => {
  const { data } = await apiClient.get<MisTurnoDTO[]>("/turnos/mios");
  return data;
};

export const listarTurnosAdmin = async (): Promise<TurnoAdminDTO[]> => {
  const { data } = await apiClient.get<TurnoAdminDTO[]>("/turnos");
  return data;
};

export const cancelarTurno = async (
  id: string,
  motivo?: string,
): Promise<MisTurnoDTO> => {
  const { data } = await apiClient.patch<{
    message: string;
    turno: MisTurnoDTO;
  }>(`/turnos/${id}/cancelar`, motivo ? { motivo } : undefined);
  return data.turno;
};

export const reagendarTurno = async (
  id: string,
  nuevaFecha: string,
  nuevaHoraInicio: string,
): Promise<MisTurnoDTO> => {
  const { data } = await apiClient.patch<{
    message: string;
    turno: MisTurnoDTO;
  }>(`/turnos/${id}/reagendar`, {
    nueva_fecha: nuevaFecha,
    nueva_hora_inicio: nuevaHoraInicio,
  });
  return data.turno;
};

// El comercio cierra un turno (completado / no_asistio)
export const cambiarEstadoTurno = async (
  id: string,
  estado: "completado" | "no_asistio",
): Promise<TurnoAdminDTO> => {
  const { data } = await apiClient.patch<{
    message: string;
    turno: TurnoAdminDTO;
  }>(`/turnos/${id}/estado`, { estado });
  return data.turno;
};

export const bloquearHorario = async (datos: {
  profesional_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo?: string;
}): Promise<{
  mensaje: string;
  fechasAfectadas: number;
  turnosAfectados: number;
}> => {
  const { data } = await apiClient.post<{
    mensaje: string;
    fechasAfectadas: number;
    turnosAfectados: number;
  }>("/turnos/bloquear-horario", datos);
  return data;
};
