import { z } from "zod";
import { diaHorarioSchema } from "./common";

export const crearUsuarioSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  telefono: z.string().trim().optional(),
});

export const crearNegocioSchema = z.object({
  nombre: z.string().trim().min(2),
  slug: z.string().trim().min(2),
});

export const crearSucursalSchema = z.object({
  negocio_id: z.string().min(1),
  nombre: z.string().trim().min(2),
  direccion: z.string().trim().min(1),
  telefono: z.string().trim().min(1),
});

export const crearServicioSchema = z.object({
  sucursal_id: z.string().min(1),
  nombre: z.string().trim().min(2),
  descripcion: z.string().trim().optional(),
  precio: z.number().positive(),
  duracion_minutos: z.number().int().positive(),
  estado: z.enum(["Activo", "Pausado"]).optional(),
});

export const actualizarServicioSchema = crearServicioSchema.partial();

// PUT /disponibilidad-semanal — la misma semanita de 1 a 7 días
export const disponibilidadSemanalSchema = z
  .array(diaHorarioSchema)
  .min(1, "La programación semanal está vacía.")
  .max(7);
