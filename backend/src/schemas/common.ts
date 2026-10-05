import { z } from "zod";

export const FECHA = /^\d{4}-\d{2}-\d{2}$/;
export const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Postgres acepta cualquier valor de 128 bits escrito con forma UUID. El patrón
// de `z.uuid()` (Zod 4) es más estricto: exige versión RFC 4122 1-8 y bits de
// variante, por lo que rechaza los UUID legibles del seed y del seeder
// (11111111-…, bbbbbbbb-…, cccccccc-…). Este patrón de forma acepta ambos casos
// y sigue rechazando strings libres ("abc", "7", SQL injection).
const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z
  .string()
  .regex(REGEX_UUID, "Identificador inválido.");

export const fechaSchema = z
  .string()
  .regex(FECHA, "Formato de fecha inválido (YYYY-MM-DD).");
export const horaSchema = z
  .string()
  .regex(HORA, "Formato de hora inválido (HH:MM).");

// Parámetros de ruta comunes (rechaza cualquier id libre, acepta solo UUID).
export const idParamsSchema = z.object({ id: uuidSchema });
export const sucursalParamsSchema = z.object({ sucursalId: uuidSchema });

// Regla de un día de la semana laboral (AdminAvailability / AdminProfile)
export const diaHorarioSchema = z.object({
  day: z.string().min(1),
  enabled: z.boolean(),
  openTime: horaSchema,
  closeTime: horaSchema,
  restStart: horaSchema,
  restEnd: horaSchema,
});
