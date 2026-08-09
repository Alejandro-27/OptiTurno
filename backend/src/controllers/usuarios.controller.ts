import { FastifyRequest, FastifyReply } from "fastify";
import { usuariosService } from "../services/usuarios.service";

export const usuariosController = {
  async registrar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const cuerpo = request.body as any;
      const nuevoUsuario = await usuariosService.registrar(cuerpo);
      return reply.status(201).send(nuevoUsuario);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  // Login de clientes (PWA) y cualquier rol del sistema
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email y contraseña son requeridos." });
      }

      const sesion = await usuariosService.login({ email, password });
      return reply.status(200).send(sesion);
    } catch (error: any) {
      const status = error.status || 500;
      return reply.status(status).send({ error: error.message });
    }
  },

  // Perfil del usuario autenticado (solo con JWT válido)
  async obtenerMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const perfil = await usuariosService.obtenerPerfil(request.usuario!.id);
      return reply.status(200).send(perfil);
    } catch (error: any) {
      return reply.status(error.status || 500).send({ error: error.message });
    }
  },

  // Actualización del perfil propio (nombre, teléfono)
  async actualizarMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { nombre, telefono } = request.body as {
        nombre?: string;
        telefono?: string;
      };
      const actualizado = await usuariosService.actualizarPerfil(
        request.usuario!.id,
        { nombre, telefono },
      );
      return reply.status(200).send(actualizado);
    } catch (error: any) {
      return reply.status(error.status || 500).send({ error: error.message });
    }
  },
};