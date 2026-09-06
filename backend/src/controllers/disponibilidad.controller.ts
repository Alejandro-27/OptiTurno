import { FastifyRequest, FastifyReply } from "fastify";
import {
  resolverSucursalDeUsuarioService,
  listarDisponibilidadSemanalService,
  guardarDisponibilidadSemanalService,
} from "../services/negocios.service.js";

interface CuerpoDisponibilidad {
  day: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
  restStart: string;
  restEnd: string;
}

// Semana laboral de la sucursal del usuario autenticado
export const obtenerDisponibilidadSemanalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
    if (!sucursal) {
      return reply
        .status(404)
        .send({ error: "Aún no hay sucursales registradas." });
    }
    const schedule = await listarDisponibilidadSemanalService(sucursal.id);
    return reply.status(200).send(schedule);
  } catch (err: any) {
    request.log.error(err, "Error en obtenerDisponibilidadSemanalHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener la disponibilidad semanal." });
  }
};

// Persiste la semana laboral a todos los profesionales de la sucursal
export const guardarDisponibilidadSemanalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
    if (!sucursal) {
      return reply
        .status(404)
        .send({ error: "Aún no hay sucursales registradas." });
    }

    const schedule = request.body as CuerpoDisponibilidad[];
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return reply
        .status(400)
        .send({ error: "La programación semanal está vacía." });
    }

    const guardado = await guardarDisponibilidadSemanalService(
      sucursal.id,
      schedule,
    );
    return reply
      .status(200)
      .send({ message: "Disponibilidad guardada con éxito.", schedule: guardado });
  } catch (err: any) {
    request.log.error(err, "Error en guardarDisponibilidadSemanalHandler");
    if (err.status) return reply.status(err.status).send({ error: err.message });
    return reply
      .status(500)
      .send({ error: "Error al guardar la disponibilidad semanal." });
  }
};