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
