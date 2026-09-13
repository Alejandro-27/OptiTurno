import { FastifyRequest, FastifyReply } from "fastify";
import {
  listarAusenciasService,
  crearAusenciasService,
  eliminarAusenciaService,
  resolverProfesionalDeUsuarioService,
} from "../services/ausencias.service";
import { validarCuerpo } from "../schemas/validar";
import { crearAusenciaSchema } from "../schemas/ausencias.schemas";

// GET /api/ausencias — ausencias del profesional vinculado al usuario autenticado
export const listarAusenciasHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const profesional = await resolverProfesionalDeUsuarioService(
    request.usuario!.id,
  );
  if (!profesional) return reply.status(200).send([]);

  const ausencias = await listarAusenciasService(profesional.id);
  return reply.status(200).send(ausencias);
};

// POST /api/ausencias — registra ausencias del profesional autenticado.
// Día completo si hora_inicio/hora_fin son null; parcial si vienen con rango.
export const crearAusenciasHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const profesional = await resolverProfesionalDeUsuarioService(
    request.usuario!.id,
  );
  if (!profesional) {
    return reply.status(404).send({
      error: "Tu cuenta no está vinculada a un profesional.",
    });
  }

  const datos = validarCuerpo(crearAusenciaSchema, request.body);
  const creadas = await crearAusenciasService({
    profesional_id: profesional.id,
    fecha: datos.fecha,
    fecha_hasta: datos.fecha_hasta,
    hora_inicio: datos.hora_inicio,
    hora_fin: datos.hora_fin,
    motivo: datos.motivo,
  });
  return reply.status(201).send(creadas);
};

// DELETE /api/ausencias/:id — elimina una ausencia propia (o de cualquiera si es superadmin)
export const eliminarAusenciaHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const resultado = await eliminarAusenciaService(
    id,
    request.usuario!.id,
    request.usuario!.rol,
  );
  return reply.send(resultado);
};
