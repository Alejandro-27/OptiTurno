import { FastifyRequest, FastifyReply } from "fastify";
import { validarCuerpo } from "../schemas/validar";
import { onboardingNegocioSchema } from "../schemas/onboarding.schemas";
import {
  crearNegocioOnboardingService,
  obtenerMiNegocioService,
} from "../services/onboarding.service";

export const onboardingController = {
  // POST /api/onboarding/negocio — Crea negocio + sucursal y vincula al admin
  async crearNegocio(request: FastifyRequest, reply: FastifyReply) {
    const input = validarCuerpo(onboardingNegocioSchema, request.body);
    const resultado = await crearNegocioOnboardingService(
      request.usuario!.id,
      input,
      request.usuario!.rol,
    );
    return reply.status(201).send(resultado);
  },

  // GET /api/onboarding/mi-negocio — Devuelve el negocio del admin autenticado
  async obtenerMiNegocio(request: FastifyRequest, reply: FastifyReply) {
    const negocio = await obtenerMiNegocioService(request.usuario!.id);
    if (!negocio) {
      return reply.status(404).send({
        error: "No tienes un negocio configurado.",
        requiereOnboarding: true,
      });
    }
    return reply.status(200).send(negocio);
  },
};
