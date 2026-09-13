import { z } from "zod";
import { fechaSchema, horaSchema } from "./common";

// POST /ausencias — día completo si hora_inicio/hora_fin son null
export const crearAusenciaSchema = z.object({
  fecha: fechaSchema,
  fecha_hasta: fechaSchema.optional(),
  hora_inicio: horaSchema.nullable().optional(),
  hora_fin: horaSchema.nullable().optional(),
  motivo: z.string().trim().optional(),
});
