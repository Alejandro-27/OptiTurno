import { z } from "zod";

// Roles que un usuario puede solicitar en el registro público.
// Decisión de producto: el registro público es SOLO de clientes.
// Los comercios (admin_negocio) y empleados los crea un superadmin (PATCH /api/usuarios/:id,
// POST /api/negocios/...). superadmin/empleado NUNCA se aceptan del body.
export const ROL_REGISTRO = z.enum(["cliente"]);
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

// Teléfono: dígitos/espacios/guiones/paréntesis, con '+' opcional.
const telefonoOpcional = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\+?[0-9\s()-]{6,20}$/),
  ])
  .optional();

export const registrarUsuarioSchema = z.object({
  email: emailObligatorio,
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  nombre: z.string().trim().min(2, "El nombre es obligatorio."),
  telefono: telefonoOpcional,
  rol: ROL_REGISTRO.optional(),
  // Honeypot anti-spam: campo oculto que los bots suelen completar.
  web: z.string().max(500).optional(),
  // Consentimiento RGPD: obligatorio para crear la cuenta. Sin aceptación hay 400.
  acepto_terminos: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar los Términos y Condiciones."),
  acepto_privacidad: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar la Política de Privacidad."),
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
