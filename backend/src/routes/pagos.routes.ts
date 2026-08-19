import { FastifyInstance } from "fastify";
import { webhookPasarelaHandler } from "../controllers/pagos.controller.js";
import { verificarFirmaWebhook } from "../middlewares/webhook.middleware.js";

export const pagosRoutes = async (fastify: FastifyInstance) => {
  // POST /api/pagos/webhook
  // Protegido por firma HMAC (header x-webhook-firma). Sin PAGOS_WEBHOOK_SECRET
  // configurado, el endpoint responde 503 (deshabilitado por defecto).
  fastify.post(
    "/webhook",
    { preHandler: [verificarFirmaWebhook] },
    webhookPasarelaHandler,
  );
};
