import { FastifyInstance } from "fastify";
import {
  listarServiciosHandler,
  listarProfesionalesHandler,
  ejecutarSeederHandler,
  crearUsuarioHandler,
  crearNegocioHandler,
  crearServicioHandler,
  crearSucursalHandler,
  actualizarServicioHandler,
  eliminarServicioHandler,
  listarSucursalesHandler,
  obtenerSucursalHandler,
  obtenerMiSucursalHandler,
} from "../controllers/negocios.controller.js";
import {
  verificarAutenticacion,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

export const negociosRoutes = async (fastify: FastifyInstance) => {
  // Catálogos públicos para armar la interfaz en el frontend
  fastify.get("/sucursales", listarSucursalesHandler);
  fastify.get(
    "/sucursales/mi-sucursal",
    { preHandler: [verificarAutenticacion] },
    obtenerMiSucursalHandler,
  );
  fastify.get("/sucursales/:sucursalId", obtenerSucursalHandler);
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
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    crearNegocioHandler,
  );
  fastify.post(
    "/sucursales",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["superadmin", "admin_negocio"]),
      ],
    },
    crearSucursalHandler,
  );
  fastify.post(
    "/servicios",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    crearServicioHandler,
  );
  fastify.put(
    "/servicios/:id",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    actualizarServicioHandler,
  );
  fastify.delete(
    "/servicios/:id",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    eliminarServicioHandler,
  );
};
