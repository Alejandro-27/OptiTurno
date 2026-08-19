import { FastifyInstance } from "fastify";
import { profesionalesController } from "../controllers/profesionales.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export default async function profesionalesRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    { preHandler: [verificarAutenticacion, permitirRoles(["admin_negocio", "superadmin"])] },
    profesionalesController.crear,
  );
}
