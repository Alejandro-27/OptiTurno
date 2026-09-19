import { z } from "zod";
import { fechaSchema, horaSchema } from "./common";

// POST /turnos/reservar — el cliente_id sale del JWT, no del body
export const reservarTurnoSchema = z.object({
  profesional_id: z.string().min(1),
  servicio_id: z.string().min(1),
  fecha: fechaSchema,
  hora_inicio: horaSchema,
});

// GET /turnos/disponibilidad — querystring
export const disponibilidadSchema = z.object({
  profesional_id: z.string().min(1),
  fecha: fechaSchema,
});

// PATCH /turnos/:id/reagendar — cliente o comercio reagendan un turno
export const reagendarTurnoSchema = z.object({
  nueva_fecha: fechaSchema,
  nueva_hora_inicio: horaSchema,
});

// PATCH /turnos/:id/cancelar — motivo y actor opcionales
export const cancelarTurnoSchema = z.object({
  motivo: z.string().max(500).optional(),
  cancelado_por: z.enum(["cliente", "comercio", "sistema"]).optional(),
});

// POST /comercio/bloquear-horario — el comercio bloquea un rango
export const bloquearHorarioSchema = z.object({
  profesional_id: z.string().min(1),
  fecha_inicio: fechaSchema,
  fecha_fin: fechaSchema,
  hora_inicio: horaSchema.nullable().optional(),
  hora_fin: horaSchema.nullable().optional(),
  motivo: z.string().max(200).optional(),
});
