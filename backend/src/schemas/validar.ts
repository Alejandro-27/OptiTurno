import type { ZodType } from "zod";
import { AppError } from "../errors/AppError";

// Valida el payload del request contra un esquema zod y lanza un AppError 400
// genérico si falla. En el futuro, el detalle del error podría incluirse en logs.
export const validarCuerpo = <T>(schema: ZodType<T>, datos: unknown): T => {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    throw new AppError(400, "La petición contiene datos inválidos.");
  }
  return resultado.data;
};
