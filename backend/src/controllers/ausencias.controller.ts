import { FastifyRequest, FastifyReply } from "fastify";
import {
  listarAusenciasService,
  crearAusenciasService,
  eliminarAusenciaService,
  resolverProfesionalDeUsuarioService,
} from "../services/ausencias.service";

interface CuerpoAusencia {
  fecha: string;
  fecha_hasta?: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
}

// GET /api/ausencias — ausencias del profesional vinculado al usuario autenticado
export const listarAusenciasHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const profesional = await resolverProfesionalDeUsuarioService(
      request.usuario!.id,
    );
    if (!profesional) return reply.status(200).send([]);

    const ausencias = await listarAusenciasService(profesional.id);
    return reply.status(200).send(ausencias);
  } catch (err: any) {
    request.log.error(err, "Error en listarAusenciasHandler");
    return reply
      .status(500)
      .send({ error: "Error al listar las ausencias." });
  }
};

// POST /api/ausencias — registra ausencias del profesional autenticado
export const crearAusenciasHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const profesional = await resolverProfesionalDeUsuarioService(
      request.usuario!.id,
    );
    if (!profesional) {
      return reply.status(404).send({
        error: "Tu cuenta no está vinculada a un profesional.",
      });
    }

    const datos = request.body as CuerpoAusencia;
    const creadas = await crearAusenciasService({
      profesional_id: profesional.id,
      fecha: datos.fecha,
      fecha_hasta: datos.fecha_hasta,
      hora_inicio: datos.hora_inicio,
      hora_fin: datos.hora_fin,
      motivo: datos.motivo,
    });
    return reply.status(201).send(creadas);
  } catch (err: any) {
    request.log.error(err, "Error en crearAusenciasHandler");
    if (err.status) return reply.status(err.status).send({ error: err.message });
    return reply
      .status(500)
      .send({ error: "Error al registrar la ausencia." });
  }
};

// DELETE /api/ausencias/:id — elimina una ausencia propia (o de cualquiera si es superadmin)
export const eliminarAusenciaHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const resultado = await eliminarAusenciaService(
      id,
      request.usuario!.id,
      request.usuario!.rol,
    );
    return reply.send(resultado);
  } catch (err: any) {
    request.log.error(err, "Error en eliminarAusenciaHandler");
    if (err.status) return reply.status(err.status).send({ error: err.message });
    return reply
      .status(500)
      .send({ error: "Error al eliminar la ausencia." });
  }
};