import { FastifyRequest, FastifyReply } from "fastify";
import {
  resolverSucursalDeUsuarioService,
  listarDisponibilidadSemanalService,
  guardarDisponibilidadSemanalService,
} from "../services/negocios.service.js";
import { validarCuerpo } from "../schemas/validar";
import { disponibilidadSemanalSchema } from "../schemas/negocios.schemas";

// Semana laboral de la sucursal del usuario autenticado
export const obtenerDisponibilidadSemanalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
  if (!sucursal) {
    return reply
      .status(404)
      .send({ error: "Aún no hay sucursales registradas." });
  }
  const schedule = await listarDisponibilidadSemanalService(sucursal.id);
  return reply.status(200).send(schedule);
};

// Persiste la semana laboral a todos los profesionales de la sucursal
export const guardarDisponibilidadSemanalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
  if (!sucursal) {
    return reply
      .status(404)
      .send({ error: "Aún no hay sucursales registradas." });
  }

  const schedule = validarCuerpo(disponibilidadSemanalSchema, request.body);
  const guardado = await guardarDisponibilidadSemanalService(
    sucursal.id,
    schedule,
  );
  return reply.status(200).send({
    message: "Disponibilidad guardada con éxito.",
    schedule: guardado,
  });
};
