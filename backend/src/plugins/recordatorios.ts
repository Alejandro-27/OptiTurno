import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { fastifyNodeCron } from "@node-cron/fastify";
import { configWhatsApp, whatsappHabilitado } from "../config/whatsapp";
import { procesarRecordatoriosService } from "../services/recordatorios.service";

/**
 * Cron de recordatorios de WhatsApp.
 *
 * Se registra solo si hay URL + API key configuradas: sin esas variables el
 * backend arranca normal (importante en producción hasta que Evolution API
 * esté desplegado). `@node-cron/fastify` arranca los jobs en `onReady` y los
 * destruye en `onClose`, así que no hay que limpiar nada a mano.
 */

export const recordatoriosPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  if (!whatsappHabilitado()) {
    fastify.log.warn(
      "Recordatorios de WhatsApp desactivados: define WHATSAPP_API_KEY para activarlos",
    );
    return;
  }

  await fastify.register(fastifyNodeCron, {
    tasks: [
      {
        name: "recordatorios-whatsapp",
        cron: configWhatsApp.cron,
        timezone: configWhatsApp.zonaHoraria,
        noOverlap: true,
        run: async () => {
          await procesarRecordatoriosService(fastify.log);
        },
      },
    ],
  });

  fastify.log.info(
    `Cron de recordatorios activo: "${configWhatsApp.cron}" (${configWhatsApp.zonaHoraria}), ventanas ${configWhatsApp.ventanas.join(",")}h hacia ${configWhatsApp.instancia}`,
  );
};
