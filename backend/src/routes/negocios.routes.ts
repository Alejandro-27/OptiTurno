import { FastifyInstance } from "fastify";
import {
  listarServiciosHandler,
  listarProfesionalesHandler,
  ejecutarSeederHandler,
  crearUsuarioHandler,
  crearNegocioHandler,
  actualizarNegocioHandler,
  eliminarNegocioHandler,
  crearServicioHandler,
  crearSucursalHandler,
  actualizarSucursalHandler,
  eliminarSucursalHandler,
  actualizarServicioHandler,
  eliminarServicioHandler,
  listarSucursalesHandler,
  obtenerSucursalHandler,
  obtenerMiSucursalHandler,
  listarUsuariosNegocioHandler,
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
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    crearNegocioHandler,
  );
  fastify.put(
    "/negocios/:id",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    actualizarNegocioHandler,
  );
  fastify.delete(
    "/negocios/:id",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    eliminarNegocioHandler,
  );
  fastify.post(
    "/sucursales",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    crearSucursalHandler,
  );
  fastify.put(
    "/sucursales/:id",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    actualizarSucursalHandler,
  );
  fastify.delete(
    "/sucursales/:id",
    {
      preHandler: [verificarAutenticacion, permitirRoles(["superadmin"])],
    },
    eliminarSucursalHandler,
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

  // Usuarios de un negocio (admin_negocio del negocio o superadmin)
  fastify.get(
    "/negocios/:id/usuarios",
    {
      preHandler: [
        verificarAutenticacion,
        permitirRoles(["admin_negocio", "superadmin"]),
      ],
    },
    listarUsuariosNegocioHandler,
  );
};
