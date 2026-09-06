import { FastifyRequest, FastifyReply } from "fastify";
import { listarActividadService } from "../services/negocios.service.js";
import { resolverSucursalDeUsuarioService } from "../services/negocios.service.js";

// Stream de eventos recientes de la sucursal del usuario autenticado
export const listarActividadHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
    if (!sucursal) {
      return reply.status(404).send({ error: "Aún no hay sucursales registradas." });
    }
    const actividad = await listarActividadService(sucursal.id);
    return reply.status(200).send(actividad);
  } catch (err: any) {
    request.log.error(err, "Error en listarActividadHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener la actividad reciente." });
  }
};