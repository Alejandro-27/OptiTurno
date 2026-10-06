import { FastifyInstance } from "fastify";
import { profesionalesController } from "../controllers/profesionales.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export default async function profesionalesRoutes(fastify: FastifyInstance) {
  // Lista profesionales (filtrado por sucursal para admin_negocio)
  fastify.get(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    profesionalesController.listar,
  );

  // Crear profesional
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

  // Editar profesional (superadmin puede mover entre sedes, admin_negocio solo campos no-sucursal)
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

  // Activar/desactivar profesional (soft-delete via profesional_sucursales.activo)
  fastify.patch(
    "/:id/estado",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    profesionalesController.cambiarEstado,
  );

  // Eliminar profesional (hard-delete, solo si no tiene turnos)
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
