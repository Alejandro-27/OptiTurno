import { FastifyInstance } from 'fastify';
import { webhookPasarelaHandler } from '../controllers/pagos.controller.js';

export const pagosRoutes = async (fastify: FastifyInstance) => {
  // POST /api/pagos/webhook
  fastify.post('/webhook', webhookPasarelaHandler);
};