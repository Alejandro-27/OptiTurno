import { FastifyRequest, FastifyReply } from "fastify";
import {
  profesionalesService,
  consultarPropietarioService,
  obtenerHorarioSemanalService,
  guardarHorarioSemanalService,
} from "../services/profesionales.service";
import { validarCuerpo } from "../schemas/validar";
import {
  crearProfesionalSchema,
  editarProfesionalSchema,
  horarioSemanalSchema,
} from "../schemas/profesionales.schemas";

export const profesionalesController = {
  async crear(request: FastifyRequest, reply: FastifyReply) {
    const datos = validarCuerpo(crearProfesionalSchema, request.body);
    const nuevoProfesional = await profesionalesService.crear(datos);
    return reply.status(201).send(nuevoProfesional);
  },

  async editar(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const datos = validarCuerpo(editarProfesionalSchema, request.body);
    const actualizado = await profesionalesService.editar(id, datos);
    return reply.send(actualizado);
  },

  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const resultado = await profesionalesService.eliminar(id);
    return reply.send(resultado);
  },

  // GET /profesionales/:id/horarios — semana laboral de un profesional
  async obtenerHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const horario = await obtenerHorarioSemanalService(id);
    return reply.send(horario);
  },

  // PUT /profesionales/:id/horarios — reemplaza la semana laboral del profesional.
  // Un empleado solo puede modificar su propio horario.
  async guardarHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const schedule = validarCuerpo(horarioSemanalSchema, request.body);

    if (request.usuario!.rol === "empleado") {
      const propietario = await consultarPropietarioService(id);
      if (propietario !== request.usuario!.id) {
        return reply.status(403).send({
          error: "No puedes modificar el horario de otro profesional.",
        });
      }
    }

    const guardado = await guardarHorarioSemanalService(id, schedule);
    return reply.send(guardado);
  },
};
