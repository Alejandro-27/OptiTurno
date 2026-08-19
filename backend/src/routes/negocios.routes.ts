import fastify, { FastifyInstance } from "fastify";
import {
  listarServiciosHandler,
  listarProfesionalesHandler,
  ejecutarSeederHandler,
  crearUsuarioHandler,
  crearNegocioHandler,
  crearServicioHandler,
  crearSucursalHandler,
} from "../controllers/negocios.controller.js";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

export const negociosRoutes = async (fastify: FastifyInstance) => {
  // Catálogos públicos para armar la interfaz en el frontend
  fastify.get("/sucursales/:sucursalId/servicios", listarServiciosHandler);
  fastify.get(
    "/sucursales/:sucursalId/profesionales",
    listarProfesionalesHandler,
  );

  // Endpoint temporal de desarrollo para rellenar datos rápido.
  // Solo accesible por el Super Administrador del sistema
  fastify.post(
    "/seed",
    { preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])] },
    ejecutarSeederHandler,
  );

  // Endpoints de escritura: solo usuarios autenticados con rol administrativo.
  // (El registro público de clientes/comercios va por /api/usuarios/registrar)
  fastify.post(
    "/usuarios",
    { preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])] },
    crearUsuarioHandler,
  );
  fastify.post(
    "/negocios",
    { preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])] },
    crearNegocioHandler,
  );
  fastify.post(
    "/sucursales",
    { preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])] },
    crearSucursalHandler,
  );
  fastify.post(
    "/servicios",
    { preHandler: [verificarAutenticacion, permitirRoles(["admin_negocio", "superadmin"])] },
    crearServicioHandler,
  );
};
