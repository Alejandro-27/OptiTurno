import { FastifyRequest, FastifyReply } from "fastify";
import { supabase } from "../config/database";
import { error } from "node:console";

// Extendemos los tipos de FastifyRequest para poder guardar los datos del usuario logueado
declare module "fastify" {
  interface FastifyRequest {
    usuario?: {
      id: string;
      email: string;
      rol: string;
    };
  }
}

// Middleware para validar que el usuario está autenticado mediante el JWT de Supabase.
export const verificarAutenticacion = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .status(401)
        .send({ error: "Acceso no autorizado. Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];

    // Valida el token directamente con el cliente de Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({ error: "Token inválido o expirado." });
    }

    // Buscamos el rol del usuario en nuestra tabla personalizada de 'usuarios'
    const { data: usuarioDb, error: errorDb } = await supabase
      .from("usuarios")
      .select("rol, nombre")
      .eq("id", user.id)
      .single();

    if (errorDb || !usuarioDb) {
      return reply.status(403).send({
        error: "El usuario no tiene un perfil configurado en el sistema.",
      });
    }

    // Inyectamos los datos del usuario en el objeto request para que los controladores puedan usarlo
    request.usuario = {
      id: user.id,
      email: user.email || "",
      rol: usuarioDb.rol,
    };
  } catch (error) {
    request.log.error(error, "Error en el middleware de autenticación.");
    return reply
      .status(500)
      .send({ error: "Error interno al validar la sesión." });
  }
};

/**
 * Middleware de Autorización por Roles (Fábrica de funciones)
 * @param rolesPermitidos Lista de roles que pueden acceder (ej: ['superadmin', 'admin_negocio'])
 */

export const permitirRoles = (rolesPermitidos: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.usuario) {
      return reply
        .status(501)
        .send({ error: "Error de configuración del servidor." });
    }

    if (!rolesPermitidos.includes(request.usuario.rol)) {
      return reply.status(401).send({
        error: "Acceso denegado.",
        detalles: `Tu rol (${request.usuario.rol}) no tiene los permisos requeridos para esta acción.`,
      });
    }
  };
};
