import { FastifyRequest, FastifyReply } from "fastify";
import { supabase } from "../config/database";

// Extendemos los tipos de FastifyRequest para poder guardar los datos del usuario logueado
declare module "fastify" {
  interface FastifyRequest {
    usuario?: {
      id: string;
      email: string;
      rol: string;
      sucursal_id: string | null;
    };
  }
}

// Jerarquía de roles: superadmin hereda de todos, admin_negocio hereda de empleado
const ROLE_HIERARCHY: Record<string, string[]> = {
  superadmin: ["superadmin", "admin_negocio", "empleado", "cliente"],
  admin_negocio: ["admin_negocio", "empleado", "cliente"],
  empleado: ["empleado", "cliente"],
  cliente: ["cliente"],
};

/**
 * Verifica si un rol tiene permiso para actuar como otro rol (jerarquía).
 * @param rolUsuario Rol del usuario autenticado
 * @param rolRequerido Rol mínimo requerido
 */
export const rolTienePermiso = (
  rolUsuario: string,
  rolRequerido: string,
): boolean => {
  const permitidos = ROLE_HIERARCHY[rolUsuario] ?? [];
  return permitidos.includes(rolRequerido);
};

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

    // Buscamos el rol y sucursal_id del usuario en nuestra tabla personalizada de 'usuarios'
    const { data: usuarioDb, error: errorDb } = await supabase
      .from("usuarios")
      .select("rol, nombre, sucursal_id")
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
      sucursal_id: usuarioDb.sucursal_id ?? null,
    };
  } catch (error) {
    request.log.error(error, "Error en el middleware de autenticación.");
    return reply
      .status(500)
      .send({ error: "Error interno al validar la sesión." });
  }
};

/**
 * Obtiene la sucursal_id efectiva del usuario autenticado según su rol:
 * - superadmin: null (sin filtro, acceso global)
 * - admin_negocio: su sucursal_id asignada (obligatoria)
 * - empleado: array de sucursal_ids desde profesional_sucursales (puede ser multi-sede)
 * - cliente: null (no aplica)
 */
export const getSucursalDelUsuario = async (
  request: FastifyRequest,
): Promise<string | string[] | null> => {
  if (!request.usuario) return null;

  const { rol, id, sucursal_id } = request.usuario;

  if (rol === "superadmin") return null; // Sin filtro, acceso global

  if (rol === "admin_negocio") {
    if (!sucursal_id) {
      throw {
        status: 403,
        message: "Tu cuenta admin_negocio no tiene una sede asignada.",
      };
    }
    return sucursal_id; // Una sola sede (string)
  }

  if (rol === "empleado") {
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("id")
      .eq("usuario_id", id)
      .single();

    if (!profesional) return null;

    const { data, error } = await supabase
      .from("profesional_sucursales")
      .select("sucursal_id")
      .eq("profesional_id", profesional.id)
      .eq("activo", true);

    if (error) throw error;
    const sucursales = (data ?? []).map((r) => r.sucursal_id);
    return sucursales.length === 1 ? sucursales[0] : sucursales; // string o string[]
  }

  return null; // cliente
};

/**
 * Middleware de Autorización por Roles (Fábrica de funciones)
 * @param rolesPermitidos Lista de roles mínimos que pueden acceder (ej: ['admin_negocio'])
 *                        superadmin siempre pasa si el rol requerido está en su jerarquía.
 */
export const permitirRoles = (rolesPermitidos: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.usuario) {
      return reply
        .status(501)
        .send({ error: "Error de configuración del servidor." });
    }

    const rolUsuario = request.usuario.rol;
    const tienePermiso = rolesPermitidos.some((r) =>
      rolTienePermiso(rolUsuario, r),
    );

    if (!tienePermiso) {
      return reply.status(403).send({
        error: "Acceso denegado.",
        detalles: `Tu rol (${rolUsuario}) no tiene los permisos requeridos para esta acción.`,
      });
    }
  };
};
