import { FastifyRequest, FastifyReply } from "fastify";
import {
  crearTurnoService,
  limpiarTurnosExpiradosService,
} from "../services/turnos.service.js";

interface ReservarTurnoBody {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}

// reservar turnos
export const reservarTurnoHandler = async (
  request: FastifyRequest<{ Body: ReservarTurnoBody }>,
  reply: FastifyReply,
) => {
  try {
    // Delegamos toda la carga al servicio
    const turno = await crearTurnoService(request.body);

    return reply.status(201).send({
      message: "Turno pre-reservado con éxito. Pago pendiente.",
      turno,
    });
  } catch (error: any) {
    if (error.status) {
      return reply.status(error.status).send({ error: error.message });
    }

    // si es un error inesperado del sistema
    request.log.error(error, "Error en el reservarTurnoHandler");
    return reply
      .status(500)
      .send({ error: "Error interno del servidor al reservar." });
  }
};

// Limpiar turnos

export const limpiarTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const resultado = await limpiarTurnosExpiradosService(15);
    return reply.status(200).send(resultado);
  } catch (error: any) {
    request.log.error(error, "Error en limpiarTurnosHandler");
    return reply
      .status(500)
      .send({ error: "Error interno al limpiar los turnos expirados." });
  }
};
