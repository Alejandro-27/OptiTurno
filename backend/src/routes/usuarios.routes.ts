import { FastifyInstance } from "fastify";
import { usuariosController } from "../controllers/usuarios.controller";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware";

export default async function usuariosRoutes(fastify: FastifyInstance) {
  // Registro: crea el usuario en Supabase Auth + perfil espejo en 'usuarios'.
  // Límite estricto: abuso de registro (spam de cuentas) se corta acá.
  fastify.post(
    "/registrar",
    { config: { rateLimit: { max: 10, timeWindow: "10 minutes" } } },
    usuariosController.registrar,
  );

  // Login de clientes (PWA) y demás roles: devuelve token JWT + perfil.
  // Límite estricto: anti fuerza bruta sobre credenciales.
  fastify.post(
    "/login",
    { config: { rateLimit: { max: 20, timeWindow: "10 minutes" } } },
    usuariosController.login,
  );

  // Perfil del usuario autenticado
  fastify.get(
    "/me",
    { preHandler: [verificarAutenticacion] },
    usuariosController.obtenerMe,
  );

  // Actualizar nombre/teléfono del perfil propio
  fastify.put(
    "/me",
    { preHandler: [verificarAutenticacion] },
    usuariosController.actualizarMe,
  );

  // Lista todos los usuarios del sistema (solo superadmin)
  fastify.get(
    "/",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    usuariosController.listarUsuarios,
  );

  // Edita correo (único) y/o rol de un usuario (solo superadmin)
  fastify.patch(
    "/:id",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    usuariosController.editarUsuario,
  );
}
