import { z } from "zod";

export const FECHA = /^\d{4}-\d{2}-\d{2}$/;
export const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export const fechaSchema = z
  .string()
  .regex(FECHA, "Formato de fecha inválido (YYYY-MM-DD).");
export const horaSchema = z
  .string()
  .regex(HORA, "Formato de hora inválido (HH:MM).");

// Regla de un día de la semana laboral (AdminAvailability / AdminProfile)
export const diaHorarioSchema = z.object({
  day: z.string().min(1),
  enabled: z.boolean(),
  openTime: horaSchema,
  closeTime: horaSchema,
  restStart: horaSchema,
  restEnd: horaSchema,
});
