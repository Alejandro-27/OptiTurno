import { FastifyInstance } from "fastify";
import {
  obtenerDisponibilidadSemanalHandler,
  guardarDisponibilidadSemanalHandler,
} from "../controllers/disponibilidad.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const disponibilidadRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    obtenerDisponibilidadSemanalHandler,
  );

  fastify.put(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    guardarDisponibilidadSemanalHandler,
  );
};