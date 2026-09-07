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

interface ReservarTurnoBody {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}

// reservar turnos (requiere sesión: cliente_id se toma del token JWT)
export const reservarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    // Delegamos toda la carga al servicio; el cliente sale del token autenticado
    const cuerpo = request.body as ReservarTurnoBody;
    const turno = await crearTurnoService({
      ...cuerpo,
      cliente_id: request.usuario!.id,
    });

    return reply.status(201).send({
      message: "Turno reservado con éxito.",
      turno,
    });
  } catch (error: any) {
    if (error.status) {
      return reply.status(error.status).send({ error: error.message });
    }

    // si es un error inesperado del sistema
    request.log.error(error, "Error en el reservarTurnoHandler");
    return reply
      .status(500)
      .send({ error: "Error interno del servidor al reservar." });
  }
};

// Limpiar turnos

export const limpiarTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const resultado = await limpiarTurnosExpiradosService(15);
    return reply.status(200).send(resultado);
  } catch (error: any) {
    request.log.error(error, "Error en limpiarTurnosHandler");
    return reply
      .status(500)
      .send({ error: "Error al limpiar los turnos expirados." });
  }
};

interface ConsultarDisponibilidadQuery {
  profesional_id: string;
  fecha: string;
}

// Historial de reservas del cliente autenticado
export const misTurnosHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const turnos = await listarTurnosClienteService(request.usuario!.id);
    return reply.status(200).send(turnos);
  } catch (error: any) {
    request.log.error(error, "Error en misTurnosHandler");
    return reply
      .status(500)
      .send({ error: "Error al consultar tus turnos." });
  }
};

// Agenda completa de la sucursal del admin (Calendario Maestro)
export const listarTurnosAdminHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
    if (!sucursal) {
      return reply
        .status(404)
        .send({ error: "Aún no hay sucursales registradas." });
    }
    const turnos = await listarTurnosAdminService(sucursal.id);
    return reply.status(200).send(turnos);
  } catch (error: any) {
    request.log.error(error, "Error en listarTurnosAdminHandler");
    return reply
      .status(500)
      .send({ error: "Error al consultar la agenda de la sucursal." });
  }
};

// Cancela un turno: clientes solo los propios; admin de la sucursal cualquiera de ella
export const cancelarTurnoHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
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
  } catch (error: any) {
    if (error.status) {
      return reply.status(error.status).send({ error: error.message });
    }
    request.log.error(error, "Error en cancelarTurnoHandler");
    return reply
      .status(500)
      .send({ error: "Error interno al cancelar el turno." });
  }
};

export const consultarDisponibilidadHandler = async (
  request: FastifyRequest<{ Querystring: ConsultarDisponibilidadQuery }>,
  reply: FastifyReply,
) => {
  try {
    const { profesional_id, fecha } = request.query;

    if (!profesional_id || !fecha) {
      return reply
        .status(400)
        .send({ error: "Faltan los parametros requeridos." });
    }

    const disponibilidad = await consultarDisponibilidadService({
      profesional_id,
      fecha,
    });
    return reply.status(200).send(disponibilidad);
  } catch (error: any) {
    request.log.error(error, "Error en consultarDisponibilidadHandler");
    return reply
      .status(500)
      .send({ error: "Error al consultar la disponibilidad de la agenda." });
  }
};
