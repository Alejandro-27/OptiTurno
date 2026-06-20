import { FastifyRequest, FastifyReply } from "fastify";
import { profesionalesService } from "../services/profesionales.service";

export const profesionalesController = {
  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      const datos = request.body as {
        sucursal_id: string;
        nombre: string;
        especialidad?: string;
        telefono?: string;
      };
      const nuevoProfesional = await profesionalesService.crear(datos);
      return reply.status(201).send(nuevoProfesional);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },
};
