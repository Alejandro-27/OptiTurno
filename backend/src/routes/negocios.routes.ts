import { FastifyInstance } from "fastify";
import {
  listarServiciosHandler,
  listarProfesionalesHandler,
  ejecutarSeederHandler,
} from "../controllers/negocios.controller.js";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

export const negociosRoutes = async (fastify: FastifyInstance) => {
  // Catálogos públicos para armar la interfaz en el frontend
  fastify.get("/sucursales/:sucursalId/servicios", listarServiciosHandler);
  fastify.get(
    "/sucursales/:sucursalId/profesionales",
    listarProfesionalesHandler,
  );

  // Endpoint temporal de desarrollo para rellenar datos rápido.
  // Solo accesible por el Super Administrador del sistema
  fastify.post(
    "/seed",
    { preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])] },
    ejecutarSeederHandler,
  );
};
