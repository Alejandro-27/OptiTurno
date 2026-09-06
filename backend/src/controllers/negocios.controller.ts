import { FastifyRequest, FastifyReply } from "fastify";
import { supabase } from "../config/database.js";
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
  estado?: string;
}

interface CuerpoActualizarServicio {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion_minutos?: number;
  estado?: string;
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
    request.log.error(err, "Error en crearUsuarioHandler");
    return reply.status(500).send({ error: "Error interno al crear el usuario." });
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
    request.log.error(err, "Error en crearNegocioHandler");
    return reply.status(500).send({ error: "Error interno al crear el negocio." });
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
    request.log.error(err, "Error en crearSucursalHandler");
    return reply.status(500).send({ error: "Error interno al crear la sucursal." });
  }
};

// Registrar un Servicio
export const crearServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { sucursal_id, nombre, descripcion, precio, duracion_minutos, estado } =
      request.body as CuerpoServicio;
    const { data, error } = await supabase
      .from("servicios")
      .insert([
        {
          sucursal_id,
          nombre,
          descripcion,
          precio,
          duracion_minutos,
          estado: estado || "Activo",
        },
      ])
      .select()
      .single();

    if (error) return reply.status(400).send({ error: error.message });
    return reply.status(201).send(data);
  } catch (err: any) {
    request.log.error(err, "Error en crearServicioHandler");
    return reply.status(500).send({ error: "Error interno al crear el servicio." });
  }
};

// Actualizar los campos editables de un servicio (incluye Activo/Pausado)
export const actualizarServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const campos = request.body as CuerpoActualizarServicio;
    const actualizado = await actualizarServicioService(id, campos);
    return reply.status(200).send(actualizado);
  } catch (err: any) {
    request.log.error(err, "Error en actualizarServicioHandler");
    if (err.status) return reply.status(err.status).send({ error: err.message });
    return reply
      .status(500)
      .send({ error: "Error interno al actualizar el servicio." });
  }
};

// Eliminar un servicio (bloqueado si tiene turnos asociados)
export const eliminarServicioHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    await eliminarServicioService(id);
    return reply
      .status(200)
      .send({ message: "Servicio eliminado con éxito." });
  } catch (err: any) {
    request.log.error(err, "Error en eliminarServicioHandler");
    if (err.status) return reply.status(err.status).send({ error: err.message });
    return reply
      .status(500)
      .send({ error: "Error interno al eliminar el servicio." });
  }
};

// Lista las sucursales del sistema (catálogo público)
export const listarSucursalesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursales = await listarSucursalesService();
    return reply.status(200).send(sucursales);
  } catch (err: any) {
    request.log.error(err, "Error en listarSucursalesHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener las sucursales." });
  }
};

// Devuelve una sucursal puntual
export const obtenerSucursalHandler = async (
  request: FastifyRequest<{ Params: { sucursalId: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { sucursalId } = request.params;
    const sucursal = await obtenerSucursalPorIdService(sucursalId);
    if (!sucursal) {
      return reply.status(404).send({ error: "La sucursal no existe." });
    }
    return reply.status(200).send(sucursal);
  } catch (err: any) {
    request.log.error(err, "Error en obtenerSucursalHandler");
    return reply
      .status(500)
      .send({ error: "Error al obtener la sucursal." });
  }
};

// Resuelve la sucursal del usuario autenticado (si trabaja en una, esa; si no, la primera)
export const obtenerMiSucursalHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const sucursal = await resolverSucursalDeUsuarioService(request.usuario!.id);
    if (!sucursal) {
      return reply.status(404).send({ error: "Aún no hay sucursales registradas." });
    }
    return reply.status(200).send(sucursal);
  } catch (err: any) {
    request.log.error(err, "Error en obtenerMiSucursalHandler");
    return reply
      .status(500)
      .send({ error: "Error al resolver tu sucursal." });
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