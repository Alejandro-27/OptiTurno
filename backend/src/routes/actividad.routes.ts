import { FastifyInstance } from "fastify";
import { listarActividadHandler } from "../controllers/actividad.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const actividadRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    listarActividadHandler,
  );
};