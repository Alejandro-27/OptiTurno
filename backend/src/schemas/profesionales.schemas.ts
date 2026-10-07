import { z } from "zod";
import { diaHorarioSchema, uuidSchema } from "./common";

export const crearProfesionalSchema = z
  .object({
    // Para superadmin: array de sucursal_ids (multi-sede)
    // Para admin_negocio: sucursal_id único (inyectado automáticamente)
    sucursal_id: uuidSchema.optional(),
    sucursal_ids: z.array(uuidSchema).min(1).optional(),
    nombre: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
    especialidad: z.string().trim().optional(),
    telefono: z.string().trim().optional(),
    // Contraseña inicial para crear la cuenta en Auth (obligatoria)
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    // Rol de la cuenta creada: profesional del equipo o administrador de la sede
    rol: z.enum(["empleado", "admin_negocio"]).default("empleado"),
  })
  .refine(
    (d) =>
      (d.sucursal_id && !d.sucursal_ids) || (!d.sucursal_id && d.sucursal_ids),
    {
      message:
        "Debe proporcionar sucursal_id (admin_negocio) o sucursal_ids[] (superadmin).",
      path: ["sucursal_id"],
    },
  );

export const editarProfesionalSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    especialidad: z.string().trim().optional(),
    telefono: z.string().trim().optional(),
    // Solo superadmin puede cambiar sedes
    sucursal_ids: z.array(uuidSchema).min(1).optional(),
  })
  .refine(
    (d) =>
      d.nombre !== undefined ||
      d.especialidad !== undefined ||
      d.telefono !== undefined ||
      d.sucursal_ids !== undefined,
    { message: "No hay campos para actualizar." },
  );

// Schema para cambiar estado (activar/desactivar)
export const cambiarEstadoProfesionalSchema = z.object({
  activo: z.boolean(),
});

// PUT /profesionales/:id/horarios — semana laboral (entre 1 y 7 días)
export const horarioSemanalSchema = z
  .array(diaHorarioSchema)
  .min(1, "La programación semanal está vacía.")
  .max(7);
