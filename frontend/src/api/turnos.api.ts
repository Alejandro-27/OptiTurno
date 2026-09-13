import { apiClient } from "./api.client";
import type {
  DisponibilidadDTO,
  MisTurnoDTO,
  ReservarTurnoInputDTO,
  TurnoAdminDTO,
} from "./dto";
import type { EstadoTurno } from "../types/enums";

// Consulta los horarios bloqueados y la jornada laboral de un profesional
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

// Envía la solicitud para reservar un turno
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

// Historial de turnos del cliente autenticado (GET /turnos/mios)
export const obtenerMisTurnos = async (): Promise<MisTurnoDTO[]> => {
  const { data } = await apiClient.get<MisTurnoDTO[]>("/turnos/mios");
  return data;
};

// Agenda completa de la sucursal del admin (GET /turnos)
export const listarTurnosAdmin = async (): Promise<TurnoAdminDTO[]> => {
  const { data } = await apiClient.get<TurnoAdminDTO[]>("/turnos");
  return data;
};

// Cancela un turno (PATCH /turnos/:id/cancelar) — backend responde { message, turno }
export const cancelarTurno = async (id: string): Promise<MisTurnoDTO> => {
  const { data } = await apiClient.patch<{
    message: string;
    turno: MisTurnoDTO;
  }>(`/turnos/${id}/cancelar`);
  return data.turno;
};
