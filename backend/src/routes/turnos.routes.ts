import { FastifyInstance } from "fastify";
import {
  reservarTurnoHandler,
  limpiarTurnosHandler,
  consultarDisponibilidadHandler,
  misTurnosHandler,
  cancelarTurnoHandler,
  reagendarTurnoHandler,
  listarTurnosAdminHandler,
  bloquearHorarioHandler,
  cambiarEstadoTurnoHandler,
} from "../controllers/turnos.controller";

import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const turnosRouter = async (fastify: FastifyInstance) => {
  fastify.post(
    "/reservar",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["cliente", "superadmin", "admin_negocio"]),
      ],
    },
    reservarTurnoHandler,
  );

  fastify.get(
    "/mios",
    {
      preHandler: [verificarAutenticacion],
    },
    misTurnosHandler,
  );

  fastify.get(
    "/",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    listarTurnosAdminHandler,
  );

  fastify.patch(
    "/:id/cancelar",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["cliente", "superadmin", "admin_negocio"]),
      ],
    },
    cancelarTurnoHandler,
  );

  fastify.patch(
    "/:id/reagendar",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["cliente", "superadmin", "admin_negocio"]),
      ],
    },
    reagendarTurnoHandler,
  );

  fastify.patch(
    "/:id/estado",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    cambiarEstadoTurnoHandler,
  );

  fastify.post(
    "/bloquear-horario",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    bloquearHorarioHandler,
  );

  fastify.post(
    "/limpiar-expirados",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    limpiarTurnosHandler,
  );

  fastify.get("/disponibilidad", consultarDisponibilidadHandler);
};
