import { FastifyRequest, FastifyReply } from "fastify";
import type Stripe from "stripe";
import { stripe } from "../config/stripe.js";

declare module "fastify" {
  interface FastifyRequest {
    stripeEvento?: Stripe.Event;
  }
}

// Verifica que el webhook provenga realmente de Stripe usando la firma
// `stripe-signature` del header y el secret STRIPE_WEBHOOK_SECRET.
// El payload debe llegar como Buffer crudo (se configura el body parser en la ruta).
export const verificarFirmaWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return reply.status(503).send({
      error: "Webhook de Stripe no configurado: falta STRIPE_WEBHOOK_SECRET en el servidor.",
    });
  }

  const firma = request.headers["stripe-signature"];

  if (!firma || typeof firma !== "string") {
    return reply
      .status(400)
      .send({ error: "Firma de webhook de Stripe ausente." });
  }

  const payload = request.body;

  // Normalizar a Buffer: con el parser scoped de la ruta ya llega crudo,
  // pero por defensa convertimos por si llega ya parseado (JSON).
  const raw = payload instanceof Buffer ? payload : Buffer.from(JSON.stringify(payload));

  try {
    const evento = stripe.webhooks.constructEvent(raw, firma, secret);
    request.stripeEvento = evento;
  } catch (err) {
    request.log.error(err, "Error verificando firma del webhook de Stripe");
    return reply.status(400).send({ error: "Firma de webhook de Stripe inválida." });
  }
};