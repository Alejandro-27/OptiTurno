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
// El join a 'usuarios' trae nombre/email del profesional.
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
          usuarios:usuario_id (id, nombre, email)
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

// Resuelve la sucursal de un usuario: si es profesional/trabaja en una sucursal
// se usa esa; en caso contrario se cae a la primera sucursal del sistema.
// Caché: 5 min, por usuario (se usa como dependency de muchos endpoints admin).
export const resolverSucursalDeUsuarioService = async (usuarioId: string) =>
  leerConCache(CLAVES.sucursalDeUsuario(usuarioId), 300, async () => {
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("sucursal_id")
      .eq("usuario_id", usuarioId)
      .maybeSingle();

    if (profesional?.sucursal_id) {
      return obtenerSucursalPorIdService(profesional.sucursal_id);
    }

    const { data: primera } = await supabase
      .from("sucursales")
      .select("id")
      .order("nombre", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!primera) return null;
    return obtenerSucursalPorIdService(primera.id);
  });

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
