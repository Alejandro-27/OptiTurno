import { apiClient } from "./api.client.js";

// Interfaz para tipar la respuesta de la disponibilidad
export interface DisponibilidadResponse {
  fecha: string;
  jornadaLaboral: { inicio: string; fin: string };
  bloquesOcupados: Array<{ hora_inicio: string; hora_fin: string }>;
}

// Consulta los horarios bloqueados y la jornada laboral de un profesional

export const obtenerDisponibilidad = async (
  profesionalId: string,
  fecha: string,
): Promise<DisponibilidadResponse> => {
  const { data } = await apiClient.get<DisponibilidadResponse>(
    "/turnos/disponibilidad",
    {
      params: { profesional_id: profesionalId, fecha },
    },
  );
  return data;
};

// Envía la solicitud para pre-reservar un espacio y obtener las llaves de pago

export const reservarTurno = async (datosReserva: {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}) => {
  const { data } = await apiClient.post("/turnos/reservar", datosReserva);
  return data;
};
