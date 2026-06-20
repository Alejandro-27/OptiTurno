import { FastifyInstance } from "fastify";
import { profesionalesController } from "../controllers/profesionales.controller";

export default async function profesionalesRoutes(fastify: FastifyInstance) {
  fastify.post("/", profesionalesController.crear);
}
