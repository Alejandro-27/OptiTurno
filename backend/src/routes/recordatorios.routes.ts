import { FastifyInstance } from "fastify";
import { procesarRecordatoriosHandler } from "../controllers/recordatorios.controller";
import { consultarEstadoInstancia } from "../services/whatsapp.service";
import { configWhatsApp, whatsappHabilitado } from "../config/whatsapp";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export const recordatoriosRoutes = async (fastify: FastifyInstance) => {
  // Disparo manual del procesamiento (protegido con x-cron-secret).
  fastify.post("/procesar", procesarRecordatoriosHandler);

  // Health del proveedor para verificar el enlace con Evolution API.
  fastify.get(
    "/estado",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    async (_request, reply) => {
      if (!whatsappHabilitado()) {
        return reply
          .status(200)
          .send({ habilitado: false, mensaje: "Falta WHATSAPP_API_KEY." });
      }
      const estado = await consultarEstadoInstancia();
      return reply.status(200).send({
        habilitado: true,
        instancia: configWhatsApp.instancia,
        estado,
      });
    },
  );
};
