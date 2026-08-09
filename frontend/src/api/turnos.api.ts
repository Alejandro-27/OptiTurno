import { apiClient } from "./api.client";
import type { DisponibilidadDTO, MisTurnoDTO, ReservarTurnoInputDTO } from "./dto";

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

// Envía la solicitud para pre-reservar un espacio y obtener las llaves de pago
export const reservarTurno = async (
  datosReserva: ReservarTurnoInputDTO,
) => {
  const { data } = await apiClient.post("/turnos/reservar", datosReserva);
  return data;
};

// Historial de turnos del cliente autenticado (GET /turnos/mios)
export const obtenerMisTurnos = async (): Promise<MisTurnoDTO[]> => {
  const { data } = await apiClient.get<MisTurnoDTO[]>("/turnos/mios");
  return data;
};

// Cancela un turno propio (PATCH /turnos/:id/cancelar)
export const cancelarTurno = async (id: string): Promise<MisTurnoDTO> => {
  const { data } = await apiClient.patch<MisTurnoDTO>(`/turnos/${id}/cancelar`);
  return data;
};