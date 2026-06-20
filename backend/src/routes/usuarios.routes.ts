import { FastifyInstance } from "fastify";
import { usuariosController } from "../controllers/usuarios.controller";

export default async function usuariosRoutes(fastify: FastifyInstance) {
  fastify.post("/registrar", usuariosController.registrar);
}
