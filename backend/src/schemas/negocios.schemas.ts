import { z } from "zod";
import { diaHorarioSchema, uuidSchema } from "./common";

export const crearUsuarioSchema = z.object({
  id: uuidSchema.optional(),
  nombre: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  telefono: z.string().trim().optional(),
});

export const crearNegocioSchema = z.object({
  nombre: z.string().trim().min(2),
  slug: z.string().trim().min(2),
});

export const actualizarNegocioSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    slug: z.string().trim().min(2).optional(),
  })
  .refine((d) => d.nombre !== undefined || d.slug !== undefined, {
    message: "No hay campos para actualizar.",
  });

export const crearSucursalSchema = z.object({
  negocio_id: uuidSchema,
  nombre: z.string().trim().min(2),
  direccion: z.string().trim().min(1),
  telefono: z.string().trim().min(1),
});

export const actualizarSucursalSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    direccion: z.string().trim().min(1).optional(),
    telefono: z.string().trim().min(1).optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.nombre !== undefined ||
      d.direccion !== undefined ||
      d.telefono !== undefined ||
      d.activo !== undefined,
    {
      message: "No hay campos para actualizar.",
    },
  );

export const crearServicioSchema = z.object({
  sucursal_id: uuidSchema,
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
