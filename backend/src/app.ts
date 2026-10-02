import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import { turnosRouter } from "./routes/turnos.routes.js";
import { negociosRoutes } from "./routes/negocios.routes.js";
import profesionalesRoutes from "./routes/profesionales.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import { actividadRoutes } from "./routes/actividad.routes";
import { disponibilidadRoutes } from "./routes/disponibilidad.routes";
import { ausenciasRoutes } from "./routes/ausencias.routes";
import { errorHandler } from "./plugins/errorHandler";

dotenv.config();

const fastify = Fastify({
  logger: true,
  // render.com y proxies confiables reenvían X-Forwarded-For: de verdad.
  // Necesario para que rate-limit y el registro de IP del consentimiento
  // funcionen detrás de proxy sin contarlos como "primera petición".
  trustProxy: true,
});

fastify.setErrorHandler(errorHandler);

fastify.setNotFoundHandler((_request, reply) => {
  return reply.status(404).send({ error: "Ruta no encontrada." });
});

const start = async () => {
  try {
    // CORS: solo orígenes explícitos (nunca origin:true).
    // En producción, definir CORS_ORIGINS="https://tu-app.vercel.app,https://otro" en el env.
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
      : ["http://localhost:4000", "http://127.0.0.1:4000"];

    // Middlewares / Plugins globales
    await fastify.register(cors, {
      origin: corsOrigins,
      methods: ["GET", "HEAD", "PUT", "POST", "PATCH", "DELETE"],
    });

    // Headers de seguridad (HSTS, X-Content-Type-Options, etc.)
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // SPA; el CSP se gestiona en Vercel/index.html
    });

    // Rate limit global (protección básica de fuerza bruta y abuso).
    // Los endpoints de auth tienen límites más estrictos (ver rutas).
    await fastify.register(rateLimit, {
      max: 300,
      timeWindow: "1 minute",
      allowList: ["127.0.0.1", "::1"],
      errorResponseBuilder: () => ({
        error: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
      }),
    });

    // Registro de Módulos de Rutas de la API
    await fastify.register(usuariosRoutes, { prefix: "/api/usuarios" }); // Registrar usuarios
    await fastify.register(turnosRouter, { prefix: "/api/turnos" }); // Ruta de los turnos
    await fastify.register(negociosRoutes, { prefix: "/api" }); // Insertar un negocio, una sucursal física y 3 servicios estructurados con precios a supabase /api/seed
    await fastify.register(profesionalesRoutes, {
      prefix: "/api/profesionales",
    }); // Registrar profesionales
    await fastify.register(actividadRoutes, { prefix: "/api/actividad" }); // Actividad reciente de la sucursal (panel admin)
    await fastify.register(disponibilidadRoutes, {
      prefix: "/api/disponibilidad-semanal",
    }); // Disponibilidad semanal (panel admin)
    await fastify.register(ausenciasRoutes, { prefix: "/api/ausencias" }); // Ausencias de profesionales (panel empleado)

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
