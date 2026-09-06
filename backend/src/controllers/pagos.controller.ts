import { FastifyRequest, FastifyReply } from "fastify";
import { confirmarPagoService } from "../services/pagos.service.js";

// Recibe el evento ya verificado por el middleware (request.stripeEvento).
export const webhookPasarelaHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const evento = request.stripeEvento;

    if (!evento) {
      return reply.status(400).send({ error: "Evento de Stripe no verificado." });
    }

    // Solo procesamos la confirmación de un PaymentIntent exitoso
    if (evento.type === "payment_intent.succeeded") {
      const paymentIntent = evento.data.object;

      const transaccionId =
        "id" in paymentIntent
          ? (paymentIntent as { id: string }).id
          : undefined;

      if (!transaccionId) {
        return reply.status(400).send({ error: "PaymentIntent sin id." });
      }

      const resultado = await confirmarPagoService(transaccionId);
      return reply.status(200).send(resultado);
    }

    // Otros eventos (pago fallido, etc.): respondemos OK pero no confirmamos el turno
    return reply.status(200).send({
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