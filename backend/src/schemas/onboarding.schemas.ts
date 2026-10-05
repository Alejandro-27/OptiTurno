import { z } from "zod";

export const onboardingNegocioSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre del negocio es obligatorio."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones.",
    ),
  sucursal: z.object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre de la sucursal es obligatorio."),
    direccion: z.string().trim().min(5, "La dirección es obligatoria."),
    telefono: z.string().trim().min(6, "El teléfono es obligatorio."),
  }),
});
