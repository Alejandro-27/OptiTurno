import { z } from "zod";

// Roles que un usuario puede solicitar en el registro público.
// superadmin/empleado NUNCA se aceptan del body (los asigna la lógica admin).
export const ROL_REGISTRO = z.enum(["cliente", "admin_negocio"]);
export const ROL_SISTEMA = z.enum([
  "cliente",
  "admin_negocio",
  "superadmin",
  "empleado",
]);

const emailObligatorio = z.string().trim().toLowerCase().pipe(z.email());
const emailOpcional = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email())
  .optional();

export const registrarUsuarioSchema = z.object({
  email: emailObligatorio,
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  nombre: z.string().trim().min(2, "El nombre es obligatorio."),
  telefono: z.string().trim().optional(),
  rol: ROL_REGISTRO.optional(),
});

export const loginSchema = z.object({
  email: emailObligatorio,
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const actualizarPerfilSchema = z
  .object({
    nombre: z.string().trim().min(2).optional(),
    telefono: z.string().trim().optional(),
  })
  .refine((d) => d.nombre !== undefined || d.telefono !== undefined, {
    message: "No hay campos para actualizar.",
  });

export const editarUsuarioSchema = z
  .object({
    email: emailOpcional,
    rol: ROL_SISTEMA.optional(),
  })
  .refine((d) => d.email !== undefined || d.rol !== undefined, {
    message: "No hay cambios para aplicar.",
  });
