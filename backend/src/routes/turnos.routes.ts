import fastify, { FastifyInstance } from "fastify";
import { reservarTurnoHandler } from "../controllers/turnos.controller";}

export const turnosRouter = async (fastify: FastifyInstance) => {
  fastify.post('/reservar', reservarTurnoHandler);
}