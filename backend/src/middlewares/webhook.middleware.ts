import { FastifyRequest, FastifyReply } from "fastify";
import { createHmac, timingSafeEqual } from "node:crypto";

// Verifica que el webhook de pagos provenga de nuestra pasarela (o simulador),
// firmando los campos del body con HMAC-SHA256 y el secret PAGOS_WEBHOOK_SECRET.
export const verificarFirmaWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const secret = process.env.PAGOS_WEBHOOK_SECRET;

  if (!secret) {
    return reply.status(503).send({
      error: "Webhook de pagos no configurado: falta PAGOS_WEBHOOK_SECRET en el servidor.",
    });
  }

  const firmaRecibida = request.headers["x-webhook-firma"];

  if (!firmaRecibida || typeof firmaRecibida !== "string") {
    return reply
      .status(401)
      .send({ error: "Firma de webhook ausente." });
  }

  const { transaccionId, evento } = request.body as {
    transaccionId?: string;
    evento?: string;
  };

  if (!transaccionId || !evento) {
    return reply
      .status(400)
      .send({ error: "Falta transaccionId o evento en la petición." });
  }

  const firmaEsperada = createHmac("sha256", secret)
    .update(`${evento}.${transaccionId}`)
    .digest("hex");

  const esperadaBuffer = Buffer.from(firmaEsperada);
  const recibidaBuffer = Buffer.from(firmaRecibida);

  if (
    esperadaBuffer.length !== recibidaBuffer.length ||
    !timingSafeEqual(esperadaBuffer, recibidaBuffer)
  ) {
    return reply
      .status(401)
      .send({ error: "Firma de webhook inválida." });
  }
};