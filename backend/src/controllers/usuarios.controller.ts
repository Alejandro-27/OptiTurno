import { FastifyRequest, FastifyReply } from "fastify";
import { usuariosService } from "../services/usuarios.service";
import { validarCuerpo } from "../schemas/validar";
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

  // Lista todos los usuarios del sistema (solo superadmin)
  async listarUsuarios(request: FastifyRequest, reply: FastifyReply) {
    const usuarios = await usuariosService.listarUsuarios();
    return reply.status(200).send(usuarios);
  },

  // Edita correo (único) y/o rol de un usuario (solo superadmin)
  async editarUsuario(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const datos = validarCuerpo(editarUsuarioSchema, request.body);
    const actualizado = await usuariosService.editarUsuario(
      id,
      request.usuario!.id,
      datos,
    );
    return reply.status(200).send(actualizado);
  },
};
