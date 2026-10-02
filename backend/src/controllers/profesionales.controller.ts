import { FastifyRequest, FastifyReply } from "fastify";
import {
  profesionalesService,
  consultarPropietarioService,
  obtenerHorarioSemanalService,
  guardarHorarioSemanalService,
} from "../services/profesionales.service";
import {
  verificarPertenenciaSucursalService,
  verificarRecursoDeSucursalService,
} from "../services/negocios.service";
import { validarCuerpo, validarParams } from "../schemas/validar";
import {
  crearProfesionalSchema,
  editarProfesionalSchema,
  horarioSemanalSchema,
} from "../schemas/profesionales.schemas";
import { idParamsSchema } from "../schemas/common";

export const profesionalesController = {
  async crear(request: FastifyRequest, reply: FastifyReply) {
    const datos = validarCuerpo(crearProfesionalSchema, request.body);
    // Multi-tenant: el admin solo crea profesionales en SU sucursal.
    await verificarPertenenciaSucursalService(
      request.usuario!.id,
      request.usuario!.rol,
      datos.sucursal_id,
    );
    const nuevoProfesional = await profesionalesService.crear(datos);
    return reply.status(201).send(nuevoProfesional);
  },

  async editar(request: FastifyRequest, reply: FastifyReply) {
    const { id } = validarParams(idParamsSchema, request.params);
    await verificarRecursoDeSucursalService(
      "profesionales",
      id,
      request.usuario!.id,
      request.usuario!.rol,
    );
    const datos = validarCuerpo(editarProfesionalSchema, request.body);
    const actualizado = await profesionalesService.editar(id, datos);
    return reply.send(actualizado);
  },

  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    const { id } = validarParams(idParamsSchema, request.params);
    await verificarRecursoDeSucursalService(
      "profesionales",
      id,
      request.usuario!.id,
      request.usuario!.rol,
    );
    const resultado = await profesionalesService.eliminar(id);
    return reply.send(resultado);
  },

  // GET /profesionales/:id/horarios — semana laboral de un profesional
  async obtenerHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    const { id } = validarParams(idParamsSchema, request.params);
    const horario = await obtenerHorarioSemanalService(id);
    return reply.send(horario);
  },

  // PUT /profesionales/:id/horarios — reemplaza la semana laboral del profesional.
  // Un empleado solo puede modificar su propio horario.
  async guardarHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    const { id } = validarParams(idParamsSchema, request.params);
    const schedule = validarCuerpo(horarioSemanalSchema, request.body);

    if (request.usuario!.rol === "empleado") {
      const propietario = await consultarPropietarioService(id);
      if (propietario !== request.usuario!.id) {
        return reply.status(403).send({
          error: "No puedes modificar el horario de otro profesional.",
        });
      }
    } else {
      // Multi-tenant: admin/superadmin solo sobre profesionales de SU sucursal.
      await verificarRecursoDeSucursalService(
        "profesionales",
        id,
        request.usuario!.id,
        request.usuario!.rol,
      );
    }

    const guardado = await guardarHorarioSemanalService(id, schedule);
    return reply.send(guardado);
  },
};
