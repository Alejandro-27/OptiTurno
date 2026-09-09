import { FastifyRequest, FastifyReply } from "fastify";
import {
  profesionalesService,
  consultarPropietarioService,
  obtenerHorarioSemanalService,
  guardarHorarioSemanalService,
} from "../services/profesionales.service";

interface DiaHorario {
  day: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
  restStart: string;
  restEnd: string;
}

export const profesionalesController = {
  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      const datos = request.body as {
        sucursal_id: string;
        nombre: string;
        email?: string;
        especialidad?: string;
        telefono?: string;
      };
      const nuevoProfesional = await profesionalesService.crear(datos);
      return reply.status(201).send(nuevoProfesional);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo crear el profesional." });
    }
  },

  async editar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const datos = request.body as {
        nombre?: string;
        especialidad?: string;
        telefono?: string;
      };
      const actualizado = await profesionalesService.editar(id, datos);
      return reply.send(actualizado);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo actualizar el profesional." });
    }
  },

  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const resultado = await profesionalesService.eliminar(id);
      return reply.send(resultado);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo eliminar el profesional." });
    }
  },

  // GET /profesionales/:id/horarios — semana laboral de un profesional
  async obtenerHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const horario = await obtenerHorarioSemanalService(id);
      return reply.send(horario);
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo obtener el horario." });
    }
  },

  // PUT /profesionales/:id/horarios — reemplaza la semana laboral del profesional.
  // Un empleado solo puede modificar su propio horario.
  async guardarHorarioSemanal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const schedule = request.body as DiaHorario[];

      if (!Array.isArray(schedule) || schedule.length === 0) {
        return reply.status(400).send({ error: "La programación semanal está vacía." });
      }

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
    } catch (error: any) {
      return reply
        .status(error?.status || 400)
        .send({ error: error?.message || "No se pudo guardar el horario." });
    }
  },
};
