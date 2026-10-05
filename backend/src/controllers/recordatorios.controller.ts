import { FastifyReply, FastifyRequest } from "fastify";
import { configWhatsApp } from "../config/whatsapp";
import { procesarRecordatoriosService } from "../services/recordatorios.service";

/**
 * Endpoint para disparar el envío de recordatorios bajo demanda (pruebas o un
 * cron externo tipo GitHub Actions / cronjob.net). Se protege con el secreto
 * `RECORDATORIOS_CRON_SECRET` en el header `x-cron-secret`.
 */
export const procesarRecordatoriosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const secreto = request.headers["x-cron-secret"];
  if (!configWhatsApp.cronSecret || secreto !== configWhatsApp.cronSecret) {
    request.log.warn(
      "Intento de disparo manual de recordatorios sin secreto válido",
    );
    return reply.status(401).send({ error: "No autorizado." });
  }

  const resumenes = await procesarRecordatoriosService(request.log);

  return reply.status(200).send({
    message: "Procesamiento de recordatorios ejecutado.",
    resumenes,
  });
};
