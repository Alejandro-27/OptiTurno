import { apiClient } from "./api.client";
import type { DisponibilidadDTO, ReservarTurnoInputDTO } from "./dto";

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