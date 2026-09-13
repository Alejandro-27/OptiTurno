import { FastifyInstance } from "fastify";
import {
  listarAusenciasHandler,
  crearAusenciasHandler,
  eliminarAusenciaHandler,
} from "../controllers/ausencias.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

const rolesPanel = ["admin_negocio", "superadmin", "empleado"];

export const ausenciasRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    "/",
    { preHandler: [verificarAutenticacion, permitirRoles(rolesPanel)] },
    listarAusenciasHandler,
  );

  fastify.post(
    "/",
    { preHandler: [verificarAutenticacion, permitirRoles(rolesPanel)] },
    crearAusenciasHandler,
  );

  fastify.delete(
    "/:id",
    { preHandler: [verificarAutenticacion, permitirRoles(rolesPanel)] },
    eliminarAusenciaHandler,
  );
};
