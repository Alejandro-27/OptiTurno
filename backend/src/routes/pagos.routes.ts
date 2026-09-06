import { FastifyInstance } from "fastify";
import { webhookPasarelaHandler } from "../controllers/pagos.controller.js";
import { verificarFirmaWebhook } from "../middlewares/webhook.middleware.js";

export const pagosRoutes = async (fastify: FastifyInstance) => {
  // Stripe verifica la firma sobre el body CRUDO. Este parser (scoped a este
  // plugin/prefix /api/pagos) entrega el Buffer sin parsear para que
  // `stripe.webhooks.constructEvent` pueda validar la firma correctamente.
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  // POST /api/pagos/webhook
  // Protegido por la firma `stripe-signature`. Sin STRIPE_WEBHOOK_SECRET
  // configurado, responde 503 (deshabilitado por defecto).
  fastify.post(
    "/webhook",
    { preHandler: [verificarFirmaWebhook] },
    webhookPasarelaHandler,
  );
};