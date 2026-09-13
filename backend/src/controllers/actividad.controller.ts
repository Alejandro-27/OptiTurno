import { FastifyRequest, FastifyReply } from "fastify";
import {
  listarActividadService,
  resolverSucursalDeUsuarioService,
} from "../services/negocios.service.js";

// Stream de eventos recientes de la sucursal del usuario autenticado
export const listarActividadHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
  if (!sucursal) {
    return reply
      .status(404)
      .send({ error: "Aún no hay sucursales registradas." });
  }
  const actividad = await listarActividadService(sucursal.id);
  return reply.status(200).send(actividad);
};
