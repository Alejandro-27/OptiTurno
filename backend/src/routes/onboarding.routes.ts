import { FastifyInstance } from "fastify";
import { onboardingController } from "../controllers/onboarding.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

const authYAdmin = [
  verificarAutenticacion,
  permitirRoles(["admin_negocio", "superadmin"]),
];

export const onboardingRoutes = async (fastify: FastifyInstance) => {
  // Crear negocio + sucursal inicial (onboarding obligatorio)
  fastify.post(
    "/negocio",
    { preHandler: authYAdmin },
    onboardingController.crearNegocio,
  );

  // Consultar si el admin ya tiene negocio (para el wizard en frontend)
  fastify.get(
    "/mi-negocio",
    { preHandler: authYAdmin },
    onboardingController.obtenerMiNegocio,
  );
};
