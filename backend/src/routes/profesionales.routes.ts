import { FastifyInstance } from "fastify";
import { profesionalesController } from "../controllers/profesionales.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export default async function profesionalesRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    profesionalesController.crear,
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    profesionalesController.editar,
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    profesionalesController.eliminar,
  );

  // Semana laboral de un profesional puntual (público, el panel empleado la usa)
  fastify.get("/:id/horarios", profesionalesController.obtenerHorarioSemanal);

  // Reemplaza la semana laboral de un profesional (empleado: solo la propia)
  fastify.put(
    "/:id/horarios",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin", "empleado"]),
      ],
    },
    profesionalesController.guardarHorarioSemanal,
  );
}
