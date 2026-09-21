import { FastifyRequest, FastifyReply } from "fastify";
import { supabase } from "../config/database.js";
import { AppError } from "../errors/AppError";
import { validarCuerpo } from "../schemas/validar";
import { CLAVES, invalidar } from "../config/cache.js";
import {
  crearUsuarioSchema,
  crearNegocioSchema,
  crearSucursalSchema,
  crearServicioSchema,
  actualizarServicioSchema,
} from "../schemas/negocios.schemas";
import {
  obtenerServiciosPorSucursalService,
  obtenerProfesionalesPorSucursalService,
  sembrarDatosInicialesService,
  listarSucursalesService,
  obtenerSucursalPorIdService,
  resolverSucursalDeUsuarioService,
  actualizarServicioService,
  eliminarServicioService,
} from "../services/negocios.service.js";

// Crear usuarios
export const crearUsuarioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id, nombre, email, telefono } = validarCuerpo(
    crearUsuarioSchema,
    request.body,
  );
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ id, nombre, email, telefono }])
    .select()
    .single();

  if (error) throw new AppError(400, "No se pudo crear el usuario.");
  return reply.status(201).send(data);
};

// Crear negocios
export const crearNegocioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { nombre, slug } = validarCuerpo(crearNegocioSchema, request.body);
  const { data, error } = await supabase
    .from("negocios")
    .insert([{ nombre, slug }])
    .select()
    .single();

  if (error) throw new AppError(400, "No se pudo crear el negocio.");
  await invalidar(CLAVES.sucursales);
  return reply.status(201).send(data);
};

// Registrar una Sucursal
export const crearSucursalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { negocio_id, nombre, direccion, telefono } = validarCuerpo(
    crearSucursalSchema,
    request.body,
  );
  const { data, error } = await supabase
    .from("sucursales")
    .insert([{ negocio_id, nombre, direccion, telefono }])
    .select()
    .single();

  if (error) throw new AppError(400, "No se pudo crear la sucursal.");
  // Una sucursal nueva puede cambiar la resolución "primera sucursal" del sistema.
  await invalidar(
    CLAVES.sucursales,
    CLAVES.sucursalPorId(data.id),
    "ot:sucursal:usr:*",
  );
  return reply.status(201).send(data);
};

// Registrar un Servicio
export const crearServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const datos = validarCuerpo(crearServicioSchema, request.body);
  const { data, error } = await supabase
    .from("servicios")
    .insert({
      sucursal_id: datos.sucursal_id,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
      duracion_minutos: datos.duracion_minutos,
      estado: datos.estado || "Activo",
    })
    .select()
    .single();

  if (error) throw new AppError(400, "No se pudo crear el servicio.");
  await invalidar(CLAVES.serviciosSucursal);
  return reply.status(201).send(data);
};

// Actualizar los campos editables de un servicio (incluye Activo/Pausado)
export const actualizarServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const campos = validarCuerpo(actualizarServicioSchema, request.body);
  const actualizado = await actualizarServicioService(id, campos);
  return reply.status(200).send(actualizado);
};

// Eliminar un servicio (bloqueado si tiene turnos asociados)
export const eliminarServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  await eliminarServicioService(id);
  return reply.status(200).send({ message: "Servicio eliminado con éxito." });
};

// Lista las sucursales del sistema (catálogo público)
export const listarSucursalesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursales = await listarSucursalesService();
  return reply.status(200).send(sucursales);
};

// Devuelve una sucursal puntual
export const obtenerSucursalHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  const { sucursalId } = request.params;
  const sucursal = await obtenerSucursalPorIdService(sucursalId);
  if (!sucursal) {
    return reply.status(404).send({ error: "La sucursal no existe." });
  }
  return reply.status(200).send(sucursal);
};

// Resuelve la sucursal del usuario autenticado (si trabaja en una, esa; si no, la primera)
export const obtenerMiSucursalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
  if (!sucursal) {
    return reply
      .status(404)
      .send({ error: "Aún no hay sucursales registradas." });
  }
  return reply.status(200).send(sucursal);
};

// Listar todos los servicios
export const listarServiciosHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  const { sucursalId } = request.params;
  const servicios = await obtenerServiciosPorSucursalService(sucursalId);
  return reply.status(200).send(servicios);
};

// Listar todos los profesionales
export const listarProfesionalesHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  const { sucursalId } = request.params;
  const profesionales =
    await obtenerProfesionalesPorSucursalService(sucursalId);
  return reply.status(200).send(profesionales);
};

// Insertar datos
export const ejecutarSeederHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const resultado = await sembrarDatosInicialesService();
  // El seeder crea negocio, sucursal, servicios, profesional y horarios:
  // invalida caché de catálogos para que no queden datos viejos.
  await invalidar(
    CLAVES.sucursales,
    CLAVES.serviciosSucursal,
    CLAVES.profesionalesSucursal,
    CLAVES.dispSemanalGeneral,
    CLAVES.horariosGeneral,
    CLAVES.dispGeneral,
    "ot:sucursal:usr:*",
  );
  return reply.status(201).send(resultado);
};
