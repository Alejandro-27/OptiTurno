import { FastifyInstance } from "fastify";
import {
  reservarTurnoHandler,
  limpiarTurnosHandler,
  consultarDisponibilidadHandler,
  misTurnosHandler,
  cancelarTurnoHandler,
} from "../controllers/turnos.controller";

import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const turnosRouter = async (fastify: FastifyInstance) => {
  // Reservar turnos: exige sesión de cliente (cliente_id sale del token JWT)
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

  // Historial de reservas del cliente autenticado (PWA)
  fastify.get(
    "/mios",
    {
      preHandler: [verificarAutenticacion],
    },
    misTurnosHandler,
  );

  // Cancelación de un turno propio (PWA cliente)
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

  // Solo accesible por el Super Administrador del sistema
  fastify.post(
    "/limpiar-expirados",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    limpiarTurnosHandler,
  ); // limpiar turnos expirados (+ 15 min)

  fastify.get("/disponibilidad", consultarDisponibilidadHandler); // Verificar qué espacios hay libres
};