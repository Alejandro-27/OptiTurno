import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { turnosRouter } from "./routes/turnos.routes.js";
import { pagosRoutes } from "./routes/pagos.routes.js";
import { negociosRoutes } from "./routes/negocios.routes.js";
import profesionalesRoutes from './routes/profesionales.routes';
import usuariosRoutes from './routes/usuarios.routes';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    // Middlewares / Plugins globales
    await fastify.register(cors, { origin: true });

    // Registro de Módulos de Rutas de la API
    await fastify.register(usuariosRoutes, { prefix: '/api/usuarios' }); // Registrar usuarios
    await fastify.register(turnosRouter, { prefix: "/api/turnos" }); // Ruta de los turnos
    await fastify.register(pagosRoutes, { prefix: "/api/pagos" }); // Ruta de pagos
    await fastify.register(negociosRoutes, { prefix: "/api" }); // Insertar un negocio, una sucursal física y 3 servicios estructurados con precios a supabase /api/seed
    await fastify.register(profesionalesRoutes, { prefix: '/api/profesionales' }); // Registrar profesionales

    // Health Check global
    fastify.get("/api/ping", async () => {
      return { status: "online", architecture: "Modular/Clean" };
    });

    const port = Number(process.env.PORT) || 5000;
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`🚀 Servidor modular corriendo en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
