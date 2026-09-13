import { z } from "zod";
import { diaHorarioSchema } from "./common";

export const crearProfesionalSchema = z.object({
  sucursal_id: z.string().min(1),
  nombre: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
  especialidad: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
});

export const editarProfesionalSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    especialidad: z.string().trim().optional(),
    telefono: z.string().trim().optional(),
  })
  .refine(
    (d) =>
      d.nombre !== undefined ||
      d.especialidad !== undefined ||
      d.telefono !== undefined,
    { message: "No hay campos para actualizar." },
  );

// PUT /profesionales/:id/horarios — semana laboral (entre 1 y 7 días)
export const horarioSemanalSchema = z
  .array(diaHorarioSchema)
  .min(1, "La programación semanal está vacía.")
  .max(7);
