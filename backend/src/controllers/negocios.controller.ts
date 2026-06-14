import { FastifyRequest, FastifyReply } from "fastify";
import {
  obtenerServiciosPorSucursalService,
  obtenerProfesionalesPorSucursalService,
  sembrarDatosInicialesService,
} from "../services/negocios.service.js";

export const listarServiciosHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { sucursalId } = request.params;
    const servicios = await obtenerServiciosPorSucursalService(sucursalId);
    return reply.status(200).send(servicios);
  } catch (error: any) {
    request.log.error(error, "Error en listarServiciosHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener el catálogo de servicios." });
  }
};

export const listarProfesionalesHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { sucursalId } = request.params;
    const profesionales =
      await obtenerProfesionalesPorSucursalService(sucursalId);
    return reply.status(200).send(profesionales);
  } catch (error: any) {
    request.log.error(error, "Error en listarProfesionalesHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener el personal de la sucursal." });
  }
};

export const ejecutarSeederHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const resultado = await sembrarDatosInicialesService();
    return reply.status(201).send(resultado);
  } catch (error: any) {
    request.log.error(error, "Error en ejecutarSeederHandler");
    return reply.status(500).send({
      error: "Error interno al ejecutar la siembra de datos.",
      detalles: error.message,
    });
  }
};
