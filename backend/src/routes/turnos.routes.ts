import fastify, { FastifyInstance } from "fastify";
import {
  reservarTurnoHandler,
  limpiarTurnosHandler,
  consultarDisponibilidadHandler,
} from "../controllers/turnos.controller";

import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const turnosRouter = async (fastify: FastifyInstance) => {
  fastify.post("/reservar", reservarTurnoHandler); // Reservar turnos

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
