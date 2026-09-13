import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/AppError";

interface ErrorControlado {
  status: number;
  message: string;
}

// Compatibilidad con el patrón histórico de los servicios: `throw { status, message }`.
function esErrorControlado(error: unknown): error is ErrorControlado {
  if (typeof error !== "object" || error === null) return false;
  const candidato = error as Record<string, unknown>;
  return (
    typeof candidato.status === "number" &&
    typeof candidato.message === "string"
  );
}

// Error handler global. Los controladores ya no envuelven try/catch:
// cualquier error lanzado termina acá. Regla #9 del AGENTS: nunca exponer
// mensajes internos al cliente; los controlados sí llevan un mensaje en español.
export const errorHandler = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof AppError) {
    return reply.status(error.status).send({ error: error.message });
  }

  // Patrón histórico `{ status, message }` de los services
  if (esErrorControlado(error)) {
    return reply.status(error.status).send({ error: error.message });
  }

  const errorObj = error as Record<string, unknown>;

  // Falla de validación de esquema (Zod o JSON Schema de Fastify)
  if (errorObj.validation || errorObj.name === "ZodError") {
    return reply
      .status(400)
      .send({ error: "La petición contiene datos inválidos." });
  }

  // Rutas inexistentes / métodos no permitidos (Fastify lanza con statusCode)
  const statusCode = errorObj.statusCode;
  if (typeof statusCode === "number") {
    return reply.status(statusCode).send({
      error:
        statusCode === 404 ? "Ruta no encontrada." : "Método no permitido.",
    });
  }

  // Error inesperado: no exponer el detalle interno, solo loguear
  request.log.error(error, `Error interno en ${request.method} ${request.url}`);
  return reply.status(500).send({ error: "Error interno del servidor." });
};
