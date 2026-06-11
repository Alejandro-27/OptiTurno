import Fastify from "fastify";
import cors from "@fastify/cors"; // Fastify maneja cors mediante su plugin oficial
import dotenv from "dotenv";
import { supabase } from "./config/database.js";

dotenv.config();

const fastify = Fastify({
  logger: true, // Logs estructurados automáticos en tu consola
});

const start = async () => {
  try {
    // Registrar CORS antes de las rutas
    await fastify.register(cors, {
      origin: true, // Permite peticiones de cualquier origen en desarrollo
    });

    // Ruta de prueba (Health Check)
    fastify.get("/api/ping", async () => {
      return {
        status: "online",
        project: "OptiTurno Backend",
        database: "PostgreSQL (Supabase) Conectado",
      };
    });

    fastify.get("/api/test-db", async (request, reply) => {
      // Consulta rápida a Supabase
      const { data, error } = await supabase
        .from("usuarios")
        .select("id")
        .limit(1);

      if (error) {
        fastify.log.error(error, "Error en Supabase: ");
        return reply
          .status(500)
          .send({
            error: "No se pudo consultar la base de datos",
            detalles: error.message,
          });
      }

      return {
        success: true,
        message: "Conexión directa con Supabase exitosa",
        data,
      };
    });

    const port = Number(process.env.PORT) || 5000;
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
