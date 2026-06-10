import Fastify from 'fastify';
import cors from '@fastify/cors'; // Fastify maneja cors mediante su plugin oficial
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true // Logs estructurados automáticos en tu consola
});

const start = async () => {
  try {
    // Registrar CORS antes de las rutas 
    await fastify.register(cors, {
      origin: true // Permite peticiones de cualquier origen en desarrollo
    });

    // Ruta de prueba (Health Check)
    fastify.get('/api/ping', async () => {
      return { status: 'online', project: 'OptiTurno Backend' };
    });

    const port = Number(process.env.PORT) || 5000;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Servidor listo en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();