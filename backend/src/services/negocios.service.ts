import { supabase } from "../config/database";
import { CLAVES, invalidar, leerConCache } from "../config/cache";

// Días de la semana en el orden de la UI, con su índice en la BD
// (mismo criterio que JS getDay(): 0=Domingo ... 6=Sábado)
const DIAS_SEMANA: Array<{ label: string; numero: number }> = [
  { label: "Lunes", numero: 1 },
  { label: "Martes", numero: 2 },
  { label: "Miércoles", numero: 3 },
  { label: "Jueves", numero: 4 },
  { label: "Viernes", numero: 5 },
  { label: "Sábado", numero: 6 },
  { label: "Domingo", numero: 0 },
];

const HORARIO_DEFECTO = {
  openTime: "09:00",
  closeTime: "18:00",
  restStart: "13:00",
  restEnd: "14:00",
};

const horaCorta = (hora: string): string => hora.slice(0, 5);

// Obtiene todos los servicios ofrecidos por una sucursal junto con su precio y duración
// Caché: 10 min. Se invalida con CLAVES.serviciosSucursal al crear/editar/eliminar servicios.
export const obtenerServiciosPorSucursalService = async (sucursalId: string) =>
  leerConCache(CLAVES.servicios(sucursalId), 600, async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select(
        "id, nombre, descripcion, precio, duracion_minutos, sucursal_id, estado",
      )
      .eq("sucursal_id", sucursalId);

    if (error) throw error;
    return data;
  });

// Obtiene la lista de profesionales que atienden en una sucursal específica.
// El join a 'usuarios' trae solo nombre (sin email): el catálogo es público y
// el email de los profesionales es dato personal y no debe exponerse.
// Caché: 10 min. Se invalida con CLAVES.profesionalesSucursal al crear/editar/eliminar profesionales.
export const obtenerProfesionalesPorSucursalService = async (
  sucursalId: string,
) =>
  leerConCache(CLAVES.profesionales(sucursalId), 600, async () => {
    const { data, error } = await supabase
      .from("profesionales")
      .select(
        `
          id,
          especialidad,
          sucursal_id,
          usuarios:usuario_id (id, nombre)
        `,
      )
      .eq("sucursal_id", sucursalId);

    if (error) throw error;
    return data;
  });

// Lista todas las sucursales del sistema (catálogo público)
// Caché: 15 min. Cambia raramente (solo vía superadmin).
export const listarSucursalesService = async () =>
  leerConCache(CLAVES.sucursales, 900, async () => {
    const { data, error } = await supabase
      .from("sucursales")
      .select(
        "id, negocio_id, nombre, direccion, telefono, negocios:negocio_id (nombre)",
      )
      .order("nombre", { ascending: true });

    if (error) throw error;
    return data || [];
  });

// Devuelve una sucursal puntual por su id
// Caché: 15 min.
export const obtenerSucursalPorIdService = async (sucursalId: string) =>
  leerConCache(CLAVES.sucursalPorId(sucursalId), 900, async () => {
    const { data, error } = await supabase
      .from("sucursales")
      .select(
        "id, negocio_id, nombre, direccion, telefono, negocios:negocio_id (nombre)",
      )
      .eq("id", sucursalId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });

// Resuelve la sucursal de un usuario según su rol (para compatibilidad legacy).
// - superadmin: null (acceso global)
// - admin_negocio: usa su sucursal_id directa (desde usuarios.sucursal_id)
// - empleado: usa profesional_sucursales (puede ser multi-sede, devuelve la principal)
export const resolverSucursalDeUsuarioService = async (usuarioId: string) =>
  leerConCache(CLAVES.sucursalDeUsuario(usuarioId), 300, async () => {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("rol, sucursal_id")
      .eq("id", usuarioId)
      .single();

    if (!usuario) return null;

    if (usuario.rol === "superadmin") return null;
    if (usuario.rol === "admin_negocio") {
      if (!usuario.sucursal_id) return null;
      return obtenerSucursalPorIdService(usuario.sucursal_id);
    }

    // Empleado: buscar en profesional_sucursales
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (!profesional) return null;

    const { data: ps } = await supabase
      .from("profesional_sucursales")
      .select("sucursal_id")
      .eq("profesional_id", profesional.id)
      .eq("es_principal", true)
      .eq("activo", true)
      .maybeSingle();

    if (!ps?.sucursal_id) return null;
    return obtenerSucursalPorIdService(ps.sucursal_id);
  });

// Verifica que el actor tiene acceso a la sucursal indicada.
// - superadmin: acceso total (plataforma).
// - admin_negocio: debe operar sobre SU sucursal asignada (usuarios.sucursal_id).
// - empleado: debe operar sobre una de sus sedes asignadas (profesional_sucursales.activo=true).
// Lanza 403 si no coincide (defensa BOLA/multi-tenant).
export const verificarPertenenciaSucursalService = async (
  usuarioId: string,
  rol: string,
  sucursalId: string,
) => {
  if (rol === "superadmin") return;

  if (rol === "admin_negocio") {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("sucursal_id")
      .eq("id", usuarioId)
      .single();

    if (!usuario?.sucursal_id || usuario.sucursal_id !== sucursalId) {
      throw {
        status: 403,
        message: "No tienes acceso a los datos de esa sucursal.",
      };
    }
    return;
  }

  if (rol === "empleado") {
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (!profesional) {
      throw {
        status: 403,
        message: "Tu cuenta no está vinculada a una sucursal.",
      };
    }

    const { data: ps } = await supabase
      .from("profesional_sucursales")
      .select("sucursal_id")
      .eq("profesional_id", profesional.id)
      .eq("activo", true);

    const sucursalesPermitidas = (ps ?? []).map((r) => r.sucursal_id);
    if (!sucursalesPermitidas.includes(sucursalId)) {
      throw {
        status: 403,
        message: "No tienes acceso a los datos de esa sucursal.",
      };
    }
    return;
  }

  throw { status: 403, message: "Rol no autorizado para esta operación." };
};

// Lee la sucursal_id de un recurso (servicio/profesional) y valida el acceso
// del actor contra ella. Devuelve el id en caso de éxito.
// Para profesionales, verifica que el actor tenga acceso a AL MENOS UNA de las sedes del profesional.
export const verificarRecursoDeSucursalService = async (
  tabla: "servicios" | "profesionales",
  recursoId: string,
  usuarioId: string,
  rol: string,
): Promise<string> => {
  const { data: recurso, error } = await supabase
    .from(tabla)
    .select("id, sucursal_id")
    .eq("id", recursoId)
    .maybeSingle();

  if (error) throw error;
  if (!recurso) {
    throw { status: 404, message: "El recurso solicitado no existe." };
  }

  if (rol === "superadmin") return recurso.id;

  if (rol === "admin_negocio") {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("sucursal_id")
      .eq("id", usuarioId)
      .single();

    if (!usuario?.sucursal_id || usuario.sucursal_id !== recurso.sucursal_id) {
      throw { status: 403, message: "No tienes acceso a este recurso." };
    }
    return recurso.id;
  }

  if (rol === "empleado") {
    // Para profesionales, verificar que el empleado tenga acceso a AL MENOS UNA de las sedes del profesional
    if (tabla === "profesionales") {
      const { data: ps } = await supabase
        .from("profesional_sucursales")
        .select("sucursal_id")
        .eq("profesional_id", recursoId)
        .eq("activo", true);

      const { data: miProfesional } = await supabase
        .from("profesionales")
        .select("id")
        .eq("usuario_id", usuarioId)
        .single();

      if (!miProfesional) {
        throw {
          status: 403,
          message: "Tu cuenta no está vinculada a un profesional.",
        };
      }

      const { data: misSedes } = await supabase
        .from("profesional_sucursales")
        .select("sucursal_id")
        .eq("profesional_id", miProfesional.id)
        .eq("activo", true);

      const misSucursales = (misSedes ?? []).map((r) => r.sucursal_id);
      const sedesRecurso = (ps ?? []).map((r) => r.sucursal_id);

      const hayInterseccion = sedesRecurso.some((s) =>
        misSucursales.includes(s),
      );
      if (!hayInterseccion) {
        throw { status: 403, message: "No tienes acceso a este profesional." };
      }
      return recurso.id;
    }

    // Para servicios, verificar que el empleado tenga acceso a la sede del servicio
    const { data: miProfesional } = await supabase
      .from("profesionales")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (!miProfesional) {
      throw {
        status: 403,
        message: "Tu cuenta no está vinculada a un profesional.",
      };
    }

    const { data: misSedes } = await supabase
      .from("profesional_sucursales")
      .select("sucursal_id")
      .eq("profesional_id", miProfesional.id)
      .eq("activo", true);

    const misSucursales = (misSedes ?? []).map((r) => r.sucursal_id);
    if (!misSucursales.includes(recurso.sucursal_id)) {
      throw { status: 403, message: "No tienes acceso a este recurso." };
    }
    return recurso.id;
  }

  throw { status: 403, message: "Rol no autorizado para esta operación." };
};

// Actualiza los datos editables de un servicio de la sucursal
export const actualizarServicioService = async (
  servicioId: string,
  campos: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    duracion_minutos?: number;
    estado?: string;
  },
) => {
  if (Object.keys(campos).length === 0) {
    throw { status: 400, message: "No hay campos para actualizar." };
  }

  const { data, error } = await supabase
    .from("servicios")
    .update(campos)
    .eq("id", servicioId)
    .select(
      "id, nombre, descripcion, precio, duracion_minutos, sucursal_id, estado",
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw { status: 404, message: "El servicio solicitado no existe." };
  }
  await invalidar(CLAVES.serviciosSucursal);
  return data;
};

// Elimina un servicio solo si no tiene turnos asociados (evita borrar historial)
export const eliminarServicioService = async (servicioId: string) => {
  const { count, error: errorCount } = await supabase
    .from("turnos")
    .select("id", { count: "exact", head: true })
    .eq("servicio_id", servicioId);

  if (errorCount) throw errorCount;

  if (count && count > 0) {
    throw {
      status: 409,
      message: "No puedes eliminar un servicio que ya tiene turnos asociados.",
    };
  }

  const { error } = await supabase
    .from("servicios")
    .delete()
    .eq("id", servicioId);

  if (error) throw error;

  await invalidar(CLAVES.serviciosSucursal);
};

// Actualiza un negocio (solo superadmin)
export const actualizarNegocioService = async (
  negocioId: string,
  campos: {
    nombre?: string;
    slug?: string;
  },
) => {
  if (Object.keys(campos).length === 0) {
    throw { status: 400, message: "No hay campos para actualizar." };
  }

  const { data, error } = await supabase
    .from("negocios")
    .update(campos)
    .eq("id", negocioId)
    .select(
      "id, nombre, slug, admin_usuario_id, activo, created_at, updated_at",
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw { status: 404, message: "El negocio no existe." };
  }
  await invalidar(CLAVES.sucursales);
  return data;
};

// Elimina un negocio (solo superadmin) — soft delete
export const eliminarNegocioService = async (negocioId: string) => {
  const { data: negocio, error: errNegocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("id", negocioId)
    .maybeSingle();

  if (errNegocio) throw errNegocio;
  if (!negocio) {
    throw { status: 404, message: "El negocio no existe." };
  }

  // Soft delete: marcar como inactivo
  const { error } = await supabase
    .from("negocios")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", negocioId);

  if (error) throw error;

  // También desactivar sus sucursales en cascada
  await supabase
    .from("sucursales")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("negocio_id", negocioId);

  await invalidar(
    CLAVES.sucursales,
    CLAVES.serviciosSucursal,
    CLAVES.profesionalesSucursal,
  );
};

// Actualiza una sucursal (solo superadmin)
export const actualizarSucursalService = async (
  sucursalId: string,
  campos: {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    activo?: boolean;
  },
) => {
  if (Object.keys(campos).length === 0) {
    throw { status: 400, message: "No hay campos para actualizar." };
  }

  const { data, error } = await supabase
    .from("sucursales")
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq("id", sucursalId)
    .select(
      "id, negocio_id, nombre, direccion, telefono, activo, created_at, updated_at",
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw { status: 404, message: "La sucursal no existe." };
  }
  await invalidar(
    CLAVES.sucursales,
    CLAVES.serviciosSucursal,
    CLAVES.profesionalesSucursal,
  );
  return data;
};

// Elimina una sucursal (solo superadmin) — soft delete
export const eliminarSucursalService = async (sucursalId: string) => {
  const { data: sucursal, error: errSuc } = await supabase
    .from("sucursales")
    .select("id, negocio_id")
    .eq("id", sucursalId)
    .maybeSingle();

  if (errSuc) throw errSuc;
  if (!sucursal) {
    throw { status: 404, message: "La sucursal no existe." };
  }

  // Verificar si tiene servicios, profesionales o turnos asociados (para logs/información)
  const [
    { count: _countServicios },
    { count: _countProfesionales },
    { count: _countTurnos },
  ] = await Promise.all([
    supabase
      .from("servicios")
      .select("id", { count: "exact", head: true })
      .eq("sucursal_id", sucursalId),
    supabase
      .from("profesionales")
      .select("id", { count: "exact", head: true })
      .eq("sucursal_id", sucursalId),
    supabase
      .from("turnos")
      .select("id", { count: "exact", head: true })
      .eq("profesionales.sucursal_id", sucursalId)
      .eq("estado", "confirmado"),
  ]);

  // Soft delete: marcar como inactivo
  const { error } = await supabase
    .from("sucursales")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", sucursalId);

  if (error) throw error;

  await invalidar(
    CLAVES.sucursales,
    CLAVES.serviciosSucursal,
    CLAVES.profesionalesSucursal,
  );
  return { id: sucursalId, eliminado: true };
};

// Últimos eventos de la sucursal, para el stream de actividad del panel admin
// Caché: 45 seg. Se invalida con CLAVES.actividadGeneral en cada mutación de turnos.
export const listarActividadService = async (sucursalId: string) =>
  leerConCache(CLAVES.actividad(sucursalId), 45, async () => {
    const { data, error } = await supabase
      .from("turnos")
      .select(
        `
          id,
          created_at,
          estado,
          profesionales:profesional_id (sucursal_id),
          clientes:cliente_id (nombre),
          servicios:servicio_id (nombre)
        `,
      )
      .eq("profesionales.sucursal_id", sucursalId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;

    interface TurnoActividad {
      id: string;
      created_at: string;
      estado: string;
      clientes?: Array<{ nombre: string }> | null;
      servicios?: Array<{ nombre: string }> | null;
    }

    const ver = (turno: TurnoActividad) => {
      const cliente = turno.clientes?.[0]?.nombre || "Cliente";
      const servicio = turno.servicios?.[0]?.nombre || "Servicio";
      const minutos = Math.max(
        1,
        Math.round((Date.now() - new Date(turno.created_at).getTime()) / 60000),
      );
      const timeSpan = `Hace ${minutos}m`;

      if (turno.estado === "cancelado") {
        return {
          id: turno.id,
          timeSpan,
          icon: "alert-triangle",
          iconColor: "text-amber-500",
          title: "Cita Cancelada",
          detail: `${cliente} - ${servicio}`,
        };
      }
      if (turno.estado === "confirmado") {
        return {
          id: turno.id,
          timeSpan,
          icon: "check-circle",
          iconColor: "text-emerald-500",
          title: "Pago Procesado",
          detail: `${cliente} - ${servicio}`,
        };
      }
      return {
        id: turno.id,
        timeSpan,
        icon: "clock",
        iconColor: "text-indigo-400",
        title: "Nueva Cita",
        detail: `${cliente} - ${servicio}`,
      };
    };

    return (data || []).map(ver);
  });

// Obtiene la primera tabla de disponibilidad semanal de la sucursal.
// Sirve de base para el panel "Disponibilidad"; se aplica a todos sus profesionales.
// Caché: 10 min. Se invalida en guardarDisponibilidadSemanalService.
export const listarDisponibilidadSemanalService = async (sucursalId: string) =>
  leerConCache(CLAVES.disponibilidadSemanal(sucursalId), 600, async () => {
    const { data: principal } = await supabase
      .from("profesionales")
      .select("id")
      .eq("sucursal_id", sucursalId)
      .limit(1)
      .maybeSingle();

    const filaVacia = (label: string) => ({
      day: label,
      enabled: false,
      ...HORARIO_DEFECTO,
    });

    if (!principal) {
      return DIAS_SEMANA.map((d) => filaVacia(d.label));
    }

    const { data: horarios, error } = await supabase
      .from("horarios_laborales")
      .select("dia_semana, hora_inicio, hora_fin")
      .eq("profesional_id", principal.id);

    if (error) throw error;

    return DIAS_SEMANA.map((d) => {
      const horario = (horarios || []).find((h) => h.dia_semana === d.numero);
      if (!horario) return filaVacia(d.label);
      return {
        day: d.label,
        enabled: true,
        ...HORARIO_DEFECTO,
        openTime: horaCorta(horario.hora_inicio),
        closeTime: horaCorta(horario.hora_fin),
      };
    });
  });

// Persiste la disponibilidad semanal a todos los profesionales de la sucursal.
export const guardarDisponibilidadSemanalService = async (
  sucursalId: string,
  schedule: Array<{
    day: string;
    enabled: boolean;
    openTime: string;
    closeTime: string;
    restStart: string;
    restEnd: string;
  }>,
) => {
  const { data: profesionales, error: errorProf } = await supabase
    .from("profesionales")
    .select("id")
    .eq("sucursal_id", sucursalId);

  if (errorProf) throw errorProf;
  if (!profesionales || profesionales.length === 0) {
    throw {
      status: 400,
      message: "Aún no hay profesionales registrados en esta sucursal.",
    };
  }

  for (const dia of DIAS_SEMANA) {
    const registro = schedule.find((s) => s.day === dia.label);
    const habilitado = registro?.enabled === true;

    for (const profesional of profesionales) {
      if (habilitado && registro) {
        await supabase
          .from("horarios_laborales")
          .delete()
          .eq("profesional_id", profesional.id)
          .eq("dia_semana", dia.numero);

        const { error } = await supabase.from("horarios_laborales").insert([
          {
            profesional_id: profesional.id,
            dia_semana: dia.numero,
            hora_inicio: `${registro.openTime}:00`,
            hora_fin: `${registro.closeTime}:00`,
          },
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("horarios_laborales")
          .delete()
          .eq("profesional_id", profesional.id)
          .eq("dia_semana", dia.numero);
        if (error) throw error;
      }
    }
  }

  // La disponibilidad semanal y los horarios individuales cambiaron: invalidar.
  await invalidar(
    CLAVES.dispSemanalGeneral,
    CLAVES.horariosGeneral,
    CLAVES.dispGeneral,
  );

  return listarDisponibilidadSemanalService(sucursalId);
};

// Script semilla para insertar datos iniciales de prueba en la base de datos

export const sembrarDatosInicialesService = async () => {
  // Crear un usuario de prueba para el PROFESIONAL en la tabla 'usuarios'
  const { error: errUserProf } = await supabase
    .from("usuarios")
    .insert([
      {
        id: "11111111-1111-1111-1111-111111111111", // UUID estático y fácil para desarrollo
        nombre: "Andrés Barbero Master",
        email: "andres.master@optiturno.com",
        telefono: "3159999999",
      },
    ])
    .select()
    .single();

  // Si el usuario ya existe por una ejecución previa, ignoramos el error y continuamos
  if (errUserProf && !errUserProf.message.includes("duplicate key")) {
    throw {
      status: 400,
      message: "No se pudo crear el usuario profesional de prueba.",
    };
  }

  // Crear un usuario de prueba para el CLIENTE en la tabla 'usuarios'
  const { error: errUserCli } = await supabase
    .from("usuarios")
    .insert([
      {
        id: "22222222-2222-2222-2222-222222222222", // Otro UUID estático de prueba
        nombre: "Alejandro Cliente Prueba",
        email: "alejandro.test@gmail.com",
        telefono: "3102222222",
      },
    ])
    .select()
    .single();

  if (errUserCli && !errUserCli.message.includes("duplicate key")) {
    throw {
      status: 400,
      message: "No se pudo crear el usuario cliente de prueba.",
    };
  }

  // Crear el negocio
  const { data: negocio, error: errN } = await supabase
    .from("negocios")
    .insert([{ nombre: "Barbería El Elegante", slug: "barberia-el-elegante" }])
    .select()
    .single();

  if (errN)
    throw { status: 400, message: `Error al crear negocio: ${errN.message}` };

  // Crear la sucursal
  const { data: sucursal, error: errS } = await supabase
    .from("sucursales")
    .insert([
      {
        negocio_id: negocio.id,
        nombre: "Sede Central Anapoima",
        direccion: "Calle 4 #5-12",
        telefono: "3101234567",
      },
    ])
    .select()
    .single();

  if (errS)
    throw { status: 400, message: `Error al crear sucursal: ${errS.message}` };

  // Crear los servicios
  const { data: servicios, error: errSer } = await supabase
    .from("servicios")
    .insert([
      {
        sucursal_id: sucursal.id,
        nombre: "Corte de Cabello Premium",
        descripcion: "Incluye lavado y perfilado de cejas",
        precio: 25000,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Barba Esculpida y Toalla Caliente",
        descripcion: "Ritual tradicional con navaja",
        precio: 18000,
        duracion_minutos: 30,
      },
      {
        sucursal_id: sucursal.id,
        nombre: "Combo Rey (Corte + Barba)",
        descripcion: "El servicio completo de la casa",
        precio: 38000,
        duracion_minutos: 60,
      },
    ])
    .select();

  if (errSer)
    throw {
      status: 400,
      message: `Error al crear servicios: ${errSer.message}`,
    };

  // Crear el Profesional apuntando al usuario '11111111...' que creamos en el paso 1
  const { data: profesional, error: errProf } = await supabase
    .from("profesionales")
    .insert([
      {
        usuario_id: "11111111-1111-1111-1111-111111111111",
        sucursal_id: sucursal.id,
        especialidad: "Barbero Master / Estilista",
      },
    ])
    .select()
    .single();

  if (errProf)
    throw {
      status: 400,
      message: `Error al crear profesional: ${errProf.message}`,
    };

  // Crear los horarios laborales para el profesional
  const { error: errHorario } = await supabase
    .from("horarios_laborales")
    .insert([
      {
        profesional_id: profesional.id,
        dia_semana: 1,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 2,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 3,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 4,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
      {
        profesional_id: profesional.id,
        dia_semana: 5,
        hora_inicio: "08:00:00",
        hora_fin: "18:00:00",
      },
    ]);

  if (errHorario)
    throw {
      status: 400,
      message: `Error al crear horarios: ${errHorario.message}`,
    };

  // Retornamos el payload listo con llaves descriptivas para mapear en Bruno
  return {
    mensaje: "Base de datos sembrada con éxito en Supabase.",
    IDs_Para_Bruno: {
      cliente_id_fijo: "22222222-2222-2222-2222-222222222222",
      sucursal_id: sucursal.id,
      profesional_id: profesional.id,
      servicio_id_corte: servicios[0].id,
      servicio_id_barba: servicios[1].id,
      servicio_id_combo: servicios[2].id,
    },
  };
};
