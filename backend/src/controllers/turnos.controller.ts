import { FastifyRequest, FastifyReply } from "fastify";
import {
  consultarDisponibilidadService,
  crearTurnoService,
  limpiarTurnosExpiradosService,
  listarTurnosClienteService,
  cancelarTurnoClienteService,
  reagendarTurnoService,
  listarTurnosAdminService,
  cancelarTurnoAdminService,
  cambiarEstadoTurnoAdminService,
  bloquearHorarioService,
} from "../services/turnos.service.js";
import { resolverSucursalDeUsuarioService } from "../services/negocios.service.js";
import { validarCuerpo } from "../schemas/validar";
import {
  reservarTurnoSchema,
  disponibilidadSchema,
  reagendarTurnoSchema,
  cambiarEstadoTurnoSchema,
  bloquearHorarioSchema,
} from "../schemas/turnos.schemas";

export const reservarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const cuerpo = validarCuerpo(reservarTurnoSchema, request.body);
  const turno = await crearTurnoService({
    ...cuerpo,
    cliente_id: request.usuario!.id,
  });

  return reply.status(201).send({
    message: "Turno reservado con éxito.",
    turno,
  });
};

export const limpiarTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const resultado = await limpiarTurnosExpiradosService(15);
  return reply.status(200).send(resultado);
};

export const misTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const turnos = await listarTurnosClienteService(request.usuario!.id);
  return reply.status(200).send(turnos);
};

export const listarTurnosAdminHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
  if (!sucursal) {
    return reply
      .status(404)
      .send({ error: "Aún no hay sucursales registradas." });
  }
  const turnos = await listarTurnosAdminService(sucursal.id);
  return reply.status(200).send(turnos);
};

export const cancelarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const usuario = request.usuario!;
  const body = request.body as Record<string, unknown> | undefined;
  const motivo = body?.motivo as string | undefined;
  const esCliente = usuario.rol === "cliente";
  const turno = esCliente
    ? await cancelarTurnoClienteService(usuario.id, id, motivo)
    : await cancelarTurnoAdminService(usuario.id, id, motivo);
  return reply.status(200).send({
    message: "Turno cancelado con éxito.",
    turno,
  });
};

export const reagendarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const usuario = request.usuario!;
  const cuerpo = validarCuerpo(reagendarTurnoSchema, request.body);
  const turno = await reagendarTurnoService(
    usuario.id,
    id,
    cuerpo.nueva_fecha,
    cuerpo.nueva_hora_inicio,
    usuario.rol,
  );
  return reply.status(200).send({
    message: "Turno reagendado con éxito.",
    turno,
  });
};

export const bloquearHorarioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const usuario = request.usuario!;
  const cuerpo = validarCuerpo(bloquearHorarioSchema, request.body);
  const resultado = await bloquearHorarioService(usuario.id, cuerpo);
  return reply.status(200).send(resultado);
};

export const cambiarEstadoTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const usuario = request.usuario!;
  const cuerpo = validarCuerpo(cambiarEstadoTurnoSchema, request.body);
  const turno = await cambiarEstadoTurnoAdminService(
    usuario.id,
    id,
    cuerpo.estado,
  );
  return reply.status(200).send({
    message: "Turno actualizado con éxito.",
    turno,
  });
};

export const consultarDisponibilidadHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { profesional_id, fecha } = validarCuerpo(
    disponibilidadSchema,
    request.query,
  );
  const disponibilidad = await consultarDisponibilidadService({
    profesional_id,
    fecha,
  });
  return reply.status(200).send(disponibilidad);
};
