import { FastifyInstance } from "fastify";
import { usuariosController } from "../controllers/usuarios.controller";
import { verificarAutenticacion } from "../middlewares/auth.middleware";

export default async function usuariosRoutes(fastify: FastifyInstance) {
  // Registro: crea el usuario en Supabase Auth + perfil espejo en 'usuarios'
  fastify.post("/registrar", usuariosController.registrar);

  // Login de clientes (PWA) y demás roles: devuelve token JWT + perfil
  fastify.post("/login", usuariosController.login);

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
}