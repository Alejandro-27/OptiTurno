import { FastifyRequest, FastifyReply } from "fastify";
import { profesionalesService } from "../services/profesionales.service";

export const profesionalesController = {
  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      const datos = request.body as {
        sucursal_id: string;
        nombre: string;
        email?: string;
        especialidad?: string;
        telefono?: string;
      };
      const nuevoProfesional = await profesionalesService.crear(datos);
      return reply.status(201).send(nuevoProfesional);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo crear el profesional." });
    }
  },

  async editar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const datos = request.body as {
        nombre?: string;
        especialidad?: string;
        telefono?: string;
      };
      const actualizado = await profesionalesService.editar(id, datos);
      return reply.send(actualizado);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo actualizar el profesional." });
    }
  },

  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const resultado = await profesionalesService.eliminar(id);
      return reply.send(resultado);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo eliminar el profesional." });
    }
  },
};
