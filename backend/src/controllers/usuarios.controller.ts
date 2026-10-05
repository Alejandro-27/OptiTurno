import { FastifyRequest, FastifyReply } from "fastify";
import { usuariosService } from "../services/usuarios.service";
import { validarCuerpo, validarParams } from "../schemas/validar";
import { idParamsSchema } from "../schemas/common";
import {
  registrarUsuarioSchema,
  loginSchema,
  actualizarPerfilSchema,
  editarUsuarioSchema,
} from "../schemas/usuarios.schemas";

export const usuariosController = {
  async registrar(request: FastifyRequest, reply: FastifyReply) {
    const cuerpo = validarCuerpo(registrarUsuarioSchema, request.body);
    const nuevoUsuario = await usuariosService.registrar(cuerpo);
    return reply.status(201).send(nuevoUsuario);
  },

  // Login de clientes (PWA) y cualquier rol del sistema
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = validarCuerpo(loginSchema, request.body);
    const sesion = await usuariosService.login({ email, password });
    return reply.status(200).send(sesion);
  },

  // Perfil del usuario autenticado (solo con JWT válido)
  async obtenerMe(request: FastifyRequest, reply: FastifyReply) {
    const perfil = await usuariosService.obtenerPerfil(request.usuario!.id);
    return reply.status(200).send(perfil);
  },

  // Actualización del perfil propio (nombre, teléfono)
  async actualizarMe(request: FastifyRequest, reply: FastifyReply) {
    const datos = validarCuerpo(actualizarPerfilSchema, request.body);
    const actualizado = await usuariosService.actualizarPerfil(
      request.usuario!.id,
      datos,
    );
    return reply.status(200).send(actualizado);
  },

  // Lista usuarios de un negocio (solo superadmin con filtro negocio_id)
  async listarUsuarios(request: FastifyRequest, reply: FastifyReply) {
    const { negocio_id } = request.query as { negocio_id?: string };
    const usuarios = await usuariosService.listarUsuarios({
      negocioId: negocio_id,
    });
    return reply.status(200).send(usuarios);
  },

  // Edita correo (único) y/o rol de un usuario (solo superadmin)
  async editarUsuario(request: FastifyRequest, reply: FastifyReply) {
    const { id } = validarParams(idParamsSchema, request.params);
    const datos = validarCuerpo(editarUsuarioSchema, request.body);
    const actualizado = await usuariosService.editarUsuario(
      id,
      request.usuario!.id,
      datos,
    );
    return reply.status(200).send(actualizado);
  },
};
