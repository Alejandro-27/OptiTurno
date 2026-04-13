import fastify, { FastifyInstance } from "fastify";
import { reservarTurnoHandler, limpiarTurnosHandler } from "../controllers/turnos.controller";

export const turnosRouter = async (fastify: FastifyInstance) => {
  
  fastify.post('/reservar', reservarTurnoHandler); // Reservar turnos

  fastify.post('/limpiar-expirados', limpiarTurnosHandler); // limpiar turnos expirados (+ 15 min)
}