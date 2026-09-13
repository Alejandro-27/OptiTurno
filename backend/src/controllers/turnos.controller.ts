import { FastifyRequest, FastifyReply } from "fastify";
import {
  consultarDisponibilidadService,
  crearTurnoService,
  limpiarTurnosExpiradosService,
  listarTurnosClienteService,
  cancelarTurnoClienteService,
  listarTurnosAdminService,
  cancelarTurnoAdminService,
} from "../services/turnos.service.js";
import { resolverSucursalDeUsuarioService } from "../services/negocios.service.js";
import { validarCuerpo } from "../schemas/validar";
import {
  reservarTurnoSchema,
  disponibilidadSchema,
} from "../schemas/turnos.schemas";

// reservar turnos (requiere sesión: cliente_id se toma del token JWT)
export const reservarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Delegamos toda la carga al servicio; el cliente sale del token autenticado
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

// Limpiar turnos
export const limpiarTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const resultado = await limpiarTurnosExpiradosService(15);
  return reply.status(200).send(resultado);
};

// Historial de reservas del cliente autenticado
export const misTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const turnos = await listarTurnosClienteService(request.usuario!.id);
  return reply.status(200).send(turnos);
};

// Agenda completa de la sucursal del admin (Calendario Maestro)
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

// Cancela un turno: clientes solo los propios; admin de la sucursal cualquiera de ella
export const cancelarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const usuario = request.usuario!;
  const esCliente = usuario.rol === "cliente";
  const turno = esCliente
    ? await cancelarTurnoClienteService(usuario.id, id)
    : await cancelarTurnoAdminService(usuario.id, id);
  return reply.status(200).send({
    message: "Turno cancelado con éxito.",
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
