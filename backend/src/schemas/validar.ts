import type { ZodType } from "zod";
import { AppError } from "../errors/AppError";

// Valida el payload del request contra un esquema zod y lanza un AppError 400
// genérico si falla. El detalle (campo + motivo) queda solo en el log del
// servidor: el cliente recibe un mensaje genérico.
export const validarCuerpo = <T>(schema: ZodType<T>, datos: unknown): T => {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((issue) => `${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
      .join(" | ");
    console.warn(`[validación 400] ${detalle}`);
    throw new AppError(400, "La petición contiene datos inválidos.");
  }
  return resultado.data;
};

// Idem para parámetros de ruta (ej. :id — exige UUID válido, no strings libres).
export const validarParams = <T>(schema: ZodType<T>, datos: unknown): T => {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    throw new AppError(400, "Identificador inválido.");
  }
  return resultado.data;
};
