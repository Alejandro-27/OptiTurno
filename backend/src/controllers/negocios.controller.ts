import { FastifyRequest, FastifyReply } from "fastify";
import { supabase } from "../config/database.js";
import {
  obtenerServiciosPorSucursalService,
  obtenerProfesionalesPorSucursalService,
  sembrarDatosInicialesService,
} from "../services/negocios.service.js";

interface CuerpoUsuario {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
}

interface CuerpoNegocio {
  nombre: string;
  slug: string;
}

interface CuerpoSucursal {
  negocio_id: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

interface CuerpoServicio {
  sucursal_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
}

// Crear usuarios
export const crearUsuarioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id, nombre, email, telefono } = request.body as CuerpoUsuario;
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ id, nombre, email, telefono }])
      .select()
      .single();

    if (error) return reply.status(400).send({ error: error.message });
    return reply.status(201).send(data);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
};

// Crear negocios
export const crearNegocioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { nombre, slug } = request.body as CuerpoNegocio;
    const { data, error } = await supabase
      .from("negocios")
      .insert([{ nombre, slug }])
      .select()
      .single();

    if (error) return reply.status(400).send({ error: error.message });
    return reply.status(201).send(data);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
};

// Registrar una Sucursal
export const crearSucursalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { negocio_id, nombre, direccion, telefono } =
      request.body as CuerpoSucursal;
    const { data, error } = await supabase
      .from("sucursales")
      .insert([{ negocio_id, nombre, direccion, telefono }])
      .select()
      .single();

    if (error) return reply.status(400).send({ error: error.message });
    return reply.status(201).send(data);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
};

// Registrar un Servicio
export const crearServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { sucursal_id, nombre, descripcion, precio, duracion_minutos } =
      request.body as CuerpoServicio;
    const { data, error } = await supabase
      .from("servicios")
      .insert([{ sucursal_id, nombre, descripcion, precio, duracion_minutos }])
      .select()
      .single();

    if (error) return reply.status(400).send({ error: error.message });
    return reply.status(201).send(data);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
};

// Listar todos los servicios
export const listarServiciosHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { sucursalId } = request.params;
    const servicios = await obtenerServiciosPorSucursalService(sucursalId);
    return reply.status(200).send(servicios);
  } catch (error: any) {
    request.log.error(error, "Error en listarServiciosHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener el catálogo de servicios." });
  }
};

// Listar todos los profesionales
export const listarProfesionalesHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { sucursalId } = request.params;
    const profesionales =
      await obtenerProfesionalesPorSucursalService(sucursalId);
    return reply.status(200).send(profesionales);
  } catch (error: any) {
    request.log.error(error, "Error en listarProfesionalesHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener el personal de la sucursal." });
  }
};

// Insertar datos
export const ejecutarSeederHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const resultado = await sembrarDatosInicialesService();
    return reply.status(201).send(resultado);
  } catch (error: any) {
    request.log.error(error, "Error en ejecutarSeederHandler");
    return reply.status(error.status || 500).send({
      error: "Error en la siembra de datos.",
      detalles: error.message || error,
    });
  }
};