import { FastifyRequest, FastifyReply } from "fastify";
import { usuariosService } from "../services/usuarios.service";

export const usuariosController = {
  async registrar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const cuerpo = request.body as any;
      const nuevoUsuario = await usuariosService.registrar(cuerpo);
      return reply.status(201).send(nuevoUsuario);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },
};
