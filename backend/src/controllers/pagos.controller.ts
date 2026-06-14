import { FastifyRequest, FastifyReply } from "fastify";
import { confirmarPagoService } from "../services/pagos.service.js";

interface WebhookPagoBody {
  transaccionId: string;
  evento: string; // Ej: 'payment_intent.succeeded'
}

export const webhookPasarelaHandler = async (
  request: FastifyRequest<{ Body: WebhookPagoBody }>,
  reply: FastifyReply,
) => {
  try {
    const { transaccionId, evento } = request.body;

    if (!transaccionId) {
      return reply
        .status(400)
        .send({ error: "Falta el transaccionId en la petición." });
    }

    // Solo procesamos si el evento es una confirmación de éxito
    if (evento === "payment_intent.succeeded" || evento === "pago_aprobado") {
      const resultado = await confirmarPagoService(transaccionId);
      return reply.status(200).send(resultado);
    }

    // Si llega otro tipo de evento (ej: pago fallido), respondemos OK pero no confirmamos el turno
    return reply
      .status(200)
      .send({
        message: "Evento recibido pero no requiere acción en la agenda.",
      });
  } catch (error: any) {
    if (error.status) {
      return reply.status(error.status).send({ error: error.message });
    }

    request.log.error(error, "Error en webhookPasarelaHandler");
    return reply
      .status(500)
      .send({ error: "Error interno al procesar el webhook de pagos." });
  }
};
