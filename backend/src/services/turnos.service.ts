import { supabase } from "../config/database.js";
import { resolverSucursalDeUsuarioService } from "./negocios.service.js";
import { CLAVES, invalidar, leerConCache } from "../config/cache.js";

// Las mutaciones sobre turnos afectan: agenda admin, turnos de clientes,
// disponibilidad (franjas libres/ocupadas) y el stream de actividad.
const invalidarDatosTurnos = async (): Promise<void> => {
  await invalidar(
    CLAVES.turnosAdminGeneral,
    CLAVES.turnosClienteGeneral,
    CLAVES.dispGeneral,
    CLAVES.actividadGeneral,
  );
};

interface CrearTurnoInput {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  // El schema exige true: la reserva registra que el titular consintió
  // el tratamiento de sus datos para gestionar la cita (RGPD).
  acepto_condiciones: boolean;
}

interface ConsultarDisponibilidadInput {
  profesional_id: string;
  fecha: string;
}

const aFechaHora = (fecha: string, hora: string): Date => {
  const segundos = hora.split(":").length === 3 ? hora : `${hora}:00`;
  return new Date(`${fecha}T${segundos}Z`);
};

export const crearTurnoService = async (datos: CrearTurnoInput) => {
  const { cliente_id, profesional_id, servicio_id, fecha, hora_inicio } = datos;

  const { data: servicio, error: errorServicio } = await supabase
    .from("servicios")
    .select("duracion_minutos, precio")
    .eq("id", servicio_id)
    .single();

  if (errorServicio || !servicio) {
    throw { status: 404, message: "El servicio solicitado no existe." };
  }

  const [horas, minutos] = hora_inicio.split(":").map(Number);
  const totalMinutosInicio = horas * 60 + minutos;
  const totalMinutosFin = totalMinutosInicio + servicio.duracion_minutos;
  const finH = Math.floor(totalMinutosFin / 60) % 24;
  const finM = totalMinutosFin % 60;
  const hora_fin = `${String(finH).padStart(2, "0")}:${String(finM).padStart(2, "0")}:00`;

  const numeroDiaSemana = new Date(fecha.replace(/-/g, "/")).getDay();

  const { data: horariosLaborales, error: errorHorarios } = await supabase
    .from("horarios_laborales")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", profesional_id)
    .eq("dia_semana", numeroDiaSemana);

  if (errorHorarios) throw errorHorarios;

  if (!horariosLaborales || horariosLaborales.length === 0) {
    throw {
      status: 409,
      message: "El profesional no atiende en el día seleccionado.",
    };
  }

  const cabeEnJornada = horariosLaborales.some((hl) => {
    return hora_inicio >= hl.hora_inicio && hora_fin <= hl.hora_fin;
  });

  if (!cabeEnJornada) {
    throw {
      status: 409,
      message:
        "El horario solicitado está fuera de la jornada laboral del profesional.",
    };
  }

  const { data: ausencias, error: errorAusencias } = await supabase
    .from("profesional_ausencias")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", profesional_id)
    .eq("fecha", fecha);

  if (errorAusencias) throw errorAusencias;

  const inicioReserva = aFechaHora(fecha, hora_inicio);
  const finReserva = aFechaHora(fecha, hora_fin);

  const bloqueado = (ausencias || []).some((a) => {
    if (!a.hora_inicio || !a.hora_fin) return true;
    const ausInicio = aFechaHora(fecha, a.hora_inicio);
    const ausFin = aFechaHora(fecha, a.hora_fin);
    return inicioReserva < ausFin && finReserva > ausInicio;
  });

  if (bloqueado) {
    throw {
      status: 409,
      message: "El profesional no está disponible en ese horario.",
    };
  }

  const { data: nuevoTurno, error: errorTurno } = await supabase
    .from("turnos")
    .insert([
      {
        cliente_id,
        profesional_id,
        servicio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado: "confirmado",
        consentimiento_hecho: true,
      },
    ])
    .select()
    .single();

  if (errorTurno) {
    if (
      errorTurno.code === "23P01" ||
      errorTurno.message.includes("no_solapar_turnos")
    ) {
      throw {
        status: 409,
        message: "Horario no disponible. Ya existe una reserva en este rango.",
      };
    }
    throw errorTurno;
  }

  await invalidarDatosTurnos();
  return { ...nuevoTurno };
};

export const limpiarTurnosExpiradosService = async (
  minutosLimite: number = 15,
) => {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - minutosLimite);
  const tiempoLimiteISO = ahora.toISOString();

  const { data, error, count } = await supabase
    .from("turnos")
    .update({
      estado: "cancelado",
      cancelado_por: "sistema",
      motivo_cancelacion: "Expirada: no se completó el pago pendiente.",
    })
    .eq("estado", "pendiente_pago")
    .lt("created_at", tiempoLimiteISO)
    .select("id");

  if (error) throw error;

  if (count && count > 0) {
    await invalidarDatosTurnos();
  }

  return {
    mensaje: "Limpieza de agenda ejecutada con éxito.",
    turnosLiberados: count || data?.length || 0,
  };
};

export const consultarDisponibilidadService = async (
  datos: ConsultarDisponibilidadInput,
) => {
  const { profesional_id, fecha } = datos;

  // Es la consulta más frecuente del PWA (cada cambio de fecha/profesional).
  // Caché de 5 seg: suficiente para evitar el golpe a Supabase sin que la
  // disponibilidad se vea vieja. Se invalida con CLAVES.dispGeneral en toda
  // mutación de turnos/ausencias.
  return leerConCache(
    CLAVES.disponibilidad(profesional_id, fecha),
    5,
    async () => {
      const numeroDiaSemana = new Date(fecha.replace(/-/g, "/")).getDay();

      const { data: horarioLaboral, error: errorHorario } = await supabase
        .from("horarios_laborales")
        .select("hora_inicio, hora_fin")
        .eq("profesional_id", profesional_id)
        .eq("dia_semana", numeroDiaSemana)
        .single();

      if (errorHorario || !horarioLaboral) {
        return {
          message:
            "El profesional no atiende en la fecha y el horario seleccionado.",
          horariosDisponibles: [],
        };
      }

      const { data: ausenciaDiaCompleto, error: errorAusencia } = await supabase
        .from("profesional_ausencias")
        .select("id")
        .eq("profesional_id", profesional_id)
        .eq("fecha", fecha)
        .is("hora_inicio", null)
        .maybeSingle();

      if (errorAusencia) throw errorAusencia;

      if (ausenciaDiaCompleto) {
        return {
          message: "El profesional no está disponible en esta fecha.",
          horariosDisponibles: [],
        };
      }

      const { data: ausenciasParciales, error: errorAusParcial } =
        await supabase
          .from("profesional_ausencias")
          .select("hora_inicio, hora_fin")
          .eq("profesional_id", profesional_id)
          .eq("fecha", fecha)
          .not("hora_inicio", "is", null);

      if (errorAusParcial) throw errorAusParcial;

      const { data: turnosOcupados, error: errorTurnos } = await supabase
        .from("turnos")
        .select("hora_inicio, hora_fin")
        .eq("profesional_id", profesional_id)
        .eq("fecha", fecha)
        .in("estado", ["confirmado", "pendiente_pago"]);

      if (errorTurnos) throw errorTurnos;

      return {
        fecha,
        jornadaLaboral: {
          inicio: horarioLaboral.hora_inicio,
          fin: horarioLaboral.hora_fin,
        },
        bloquesOcupados: [
          ...(turnosOcupados || []),
          ...(ausenciasParciales || []),
        ],
      };
    },
  );
};
export const listarTurnosClienteService = async (usuarioId: string) =>
  // Caché por cliente 15 seg (junto a la invalidación en mutaciones).
  leerConCache(CLAVES.turnosCliente(usuarioId), 15, async () => {
    const { data: turnos, error } = await supabase
      .from("turnos")
      .select(
        `
          id, fecha, hora_inicio, hora_fin, estado,
          motivo_cancelacion, cancelado_por, created_at,
          servicios:servicio_id (nombre, precio, duracion_minutos),
          profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
        `,
      )
      .eq("cliente_id", usuarioId)
      .order("fecha", { ascending: false })
      .order("hora_inicio", { ascending: false });

    if (error) throw error;
    return turnos || [];
  });

export const cancelarTurnoClienteService = async (
  usuarioId: string,
  turnoId: string,
  motivo?: string,
) => {
  const { data: turno, error: errorBusqueda } = await supabase
    .from("turnos")
    .select("id, cliente_id, estado")
    .eq("id", turnoId)
    .single();

  if (errorBusqueda || !turno) {
    throw { status: 404, message: "El turno solicitado no existe." };
  }

  if (turno.cliente_id !== usuarioId) {
    throw {
      status: 403,
      message: "No puedes cancelar un turno de otro cliente.",
    };
  }

  if (turno.estado === "cancelado") {
    throw { status: 409, message: "El turno ya se encuentra cancelado." };
  }

  const { data: actualizado, error } = await supabase
    .from("turnos")
    .update({
      estado: "cancelado",
      motivo_cancelacion: motivo || null,
      cancelado_por: "cliente",
    })
    .eq("id", turnoId)
    .select(
      `
        id, fecha, hora_inicio, hora_fin, estado,
        motivo_cancelacion, cancelado_por,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (error) {
    throw { status: 400, message: "No se pudo actualizar el turno." };
  }
  await invalidarDatosTurnos();
  return actualizado;
};

export const reagendarTurnoService = async (
  usuarioId: string,
  turnoId: string,
  nuevaFecha: string,
  nuevaHoraInicio: string,
  rol: string,
) => {
  const { data: turno, error: errBusq } = await supabase
    .from("turnos")
    .select(
      "id, cliente_id, profesional_id, servicio_id, fecha, hora_inicio, hora_fin, estado",
    )
    .eq("id", turnoId)
    .single();

  if (errBusq || !turno) {
    throw { status: 404, message: "El turno solicitado no existe." };
  }

  if (rol === "cliente" && turno.cliente_id !== usuarioId) {
    throw {
      status: 403,
      message: "No puedes reagendar un turno de otro cliente.",
    };
  }

  if (turno.estado === "cancelado" || turno.estado === "reagendado") {
    throw {
      status: 409,
      message: "No se puede reagendar un turno cancelado o ya reagendado.",
    };
  }

  const { data: servicio, error: errServ } = await supabase
    .from("servicios")
    .select("duracion_minutos")
    .eq("id", turno.servicio_id)
    .single();

  if (errServ || !servicio) {
    throw { status: 404, message: "El servicio del turno no existe." };
  }

  const [h, m, s] = nuevaHoraInicio.split(":").map(Number);
  const base = new Date(2026, 0, 1, h, m, s || 0);
  base.setMinutes(base.getMinutes() + servicio.duracion_minutos);
  const nuevaHoraFin = base.toTimeString().split(" ")[0];

  const { data: ausencias } = await supabase
    .from("profesional_ausencias")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", turno.profesional_id)
    .eq("fecha", nuevaFecha);

  const inicioNuevo = aFechaHora(nuevaFecha, nuevaHoraInicio);
  const finNuevo = aFechaHora(nuevaFecha, nuevaHoraFin);

  const bloqueado = (ausencias || []).some((a) => {
    if (!a.hora_inicio || !a.hora_fin) return true;
    const ausInicio = aFechaHora(nuevaFecha, a.hora_inicio);
    const ausFin = aFechaHora(nuevaFecha, a.hora_fin);
    return inicioNuevo < ausFin && finNuevo > ausInicio;
  });

  if (bloqueado) {
    throw {
      status: 409,
      message: "El profesional no está disponible en el nuevo horario.",
    };
  }

  const { data: ocupados } = await supabase
    .from("turnos")
    .select("id, hora_inicio, hora_fin")
    .eq("profesional_id", turno.profesional_id)
    .eq("fecha", nuevaFecha)
    .in("estado", ["confirmado", "pendiente_reagendamiento"])
    .neq("id", turnoId);

  if (ocupados) {
    for (const o of ocupados) {
      const occInicio = aFechaHora(nuevaFecha, o.hora_inicio);
      const occFin = aFechaHora(nuevaFecha, o.hora_fin);
      if (inicioNuevo < occFin && finNuevo > occInicio) {
        throw {
          status: 409,
          message:
            "Horario no disponible. Ya existe una reserva en este rango.",
        };
      }
    }
  }

  const { error: errUpd } = await supabase
    .from("turnos")
    .update({ estado: "reagendado" })
    .eq("id", turnoId);

  if (errUpd) {
    throw { status: 400, message: "No se pudo marcar el turno original." };
  }

  const { data: nuevoTurno, error: errIns } = await supabase
    .from("turnos")
    .insert([
      {
        cliente_id: turno.cliente_id,
        profesional_id: turno.profesional_id,
        servicio_id: turno.servicio_id,
        fecha: nuevaFecha,
        hora_inicio: nuevaHoraInicio,
        hora_fin: nuevaHoraFin,
        estado: "confirmado",
      },
    ])
    .select(
      `
        id, fecha, hora_inicio, hora_fin, estado, created_at,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (errIns) {
    if (
      errIns.code === "23P01" ||
      errIns.message.includes("no_solapar_turnos")
    ) {
      throw {
        status: 409,
        message: "Horario no disponible. Ya existe una reserva en este rango.",
      };
    }
    throw errIns;
  }

  await invalidarDatosTurnos();

  return nuevoTurno;
};

export const listarTurnosAdminService = async (
  sucursalId: string,
  profesionalId?: string,
) => {
  const claveCache = profesionalId
    ? `${CLAVES.turnosAdmin(sucursalId)}:prof:${profesionalId}`
    : CLAVES.turnosAdmin(sucursalId);

  return leerConCache(claveCache, 30, async () => {
    // 1. Resolver todos los profesionales de la sucursal (N:M + directos)
    const { data: ps } = await supabase
      .from("profesional_sucursales")
      .select("profesional_id")
      .eq("sucursal_id", sucursalId)
      .eq("activo", true);

    const idsFromPs = (ps || []).map((p) => p.profesional_id);

    const { data: directos } = await supabase
      .from("profesionales")
      .select("id")
      .eq("sucursal_id", sucursalId);

    const idsDirectos = (directos || []).map((p) => p.id);
    const todosIds = Array.from(new Set([...idsFromPs, ...idsDirectos]));

    if (todosIds.length === 0) return [];

    let query = supabase
      .from("turnos")
      .select(
        `
        id, fecha, hora_inicio, hora_fin, estado,
        motivo_cancelacion, cancelado_por, created_at,
        clientes:cliente_id (id, nombre, telefono),
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, sucursal_id, usuarios:usuario_id (nombre))
        `,
      )
      .order("hora_inicio", { ascending: true });

    if (profesionalId) {
      if (!todosIds.includes(profesionalId)) return [];
      query = query.eq("profesional_id", profesionalId);
    } else {
      query = query.in("profesional_id", todosIds);
    }

    const { data: turnos, error } = await query;
    if (error) throw error;
    return turnos || [];
  });
};

export const cancelarTurnoAdminService = async (
  usuarioId: string,
  turnoId: string,
  motivo?: string,
) => {
  const sucursal = await resolverSucursalDeUsuarioService(usuarioId);
  if (!sucursal) {
    throw {
      status: 403,
      message: "Tu cuenta no está vinculada a ninguna sucursal.",
    };
  }

  const { data: turno, error: errorBusqueda } = await supabase
    .from("turnos")
    .select(
      "id, estado, profesional_id, profesionales:profesional_id (id, sucursal_id)",
    )
    .eq("id", turnoId)
    .single();

  if (errorBusqueda || !turno) {
    throw { status: 404, message: "El turno solicitado no existe." };
  }

  const { data: ps } = await supabase
    .from("profesional_sucursales")
    .select("sucursal_id")
    .eq("profesional_id", turno.profesional_id)
    .eq("sucursal_id", sucursal.id)
    .eq("activo", true)
    .maybeSingle();

  const profesional = Array.isArray(turno.profesionales)
    ? turno.profesionales[0]
    : turno.profesionales;

  const pertenece = Boolean(
    ps || (profesional && profesional.sucursal_id === sucursal.id),
  );

  if (!pertenece) {
    throw {
      status: 403,
      message: "No puedes cancelar turnos de otra sucursal.",
    };
  }

  if (turno.estado === "cancelado") {
    throw { status: 409, message: "El turno ya se encuentra cancelado." };
  }

  const { data: actualizado, error } = await supabase
    .from("turnos")
    .update({
      estado: "cancelado",
      motivo_cancelacion: motivo || null,
      cancelado_por: "comercio",
    })
    .eq("id", turnoId)
    .select(
      `
        id, fecha, hora_inicio, hora_fin, estado,
        motivo_cancelacion, cancelado_por,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (error) {
    throw { status: 400, message: "No se pudo actualizar el turno." };
  }
  await invalidarDatosTurnos();
  return actualizado;
};

// Cierra un turno desde el panel admin (completado / no_asistio).
// Valida pertenencia a la sucursal del usuario logueado.
export const cambiarEstadoTurnoAdminService = async (
  usuarioId: string,
  turnoId: string,
  estado: "completado" | "no_asistio",
) => {
  const sucursal = await resolverSucursalDeUsuarioService(usuarioId);
  if (!sucursal) {
    throw {
      status: 403,
      message: "Tu cuenta no está vinculada a ninguna sucursal.",
    };
  }

  const { data: turno, error: errorBusqueda } = await supabase
    .from("turnos")
    .select(
      "id, estado, profesional_id, profesionales:profesional_id (id, sucursal_id)",
    )
    .eq("id", turnoId)
    .single();

  if (errorBusqueda || !turno) {
    throw { status: 404, message: "El turno solicitado no existe." };
  }

  const { data: ps } = await supabase
    .from("profesional_sucursales")
    .select("sucursal_id")
    .eq("profesional_id", turno.profesional_id)
    .eq("sucursal_id", sucursal.id)
    .eq("activo", true)
    .maybeSingle();

  const profesional = Array.isArray(turno.profesionales)
    ? turno.profesionales[0]
    : turno.profesionales;

  const pertenece = Boolean(
    ps || (profesional && profesional.sucursal_id === sucursal.id),
  );

  if (!pertenece) {
    throw {
      status: 403,
      message: "No puedes modificar turnos de otra sucursal.",
    };
  }

  if (turno.estado === "cancelado") {
    throw {
      status: 409,
      message: "El turno está cancelado y no se puede cerrar.",
    };
  }

  if (turno.estado === "completado" || turno.estado === "no_asistio") {
    throw {
      status: 409,
      message: `El turno ya está marcado como ${turno.estado}.`,
    };
  }

  const { data: actualizado, error } = await supabase
    .from("turnos")
    .update({ estado })
    .eq("id", turnoId)
    .select(
      `
        id, fecha, hora_inicio, hora_fin, estado,
        motivo_cancelacion, cancelado_por,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (error) {
    throw { status: 400, message: "No se pudo actualizar el turno." };
  }
  await invalidarDatosTurnos();
  return actualizado;
};

export const bloquearHorarioService = async (
  usuarioId: string,
  datos: {
    profesional_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    hora_inicio?: string | null;
    hora_fin?: string | null;
    motivo?: string;
  },
) => {
  const sucursal = await resolverSucursalDeUsuarioService(usuarioId);
  if (!sucursal) {
    throw {
      status: 403,
      message: "Tu cuenta no está vinculada a ninguna sucursal.",
    };
  }

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("id, sucursal_id")
    .eq("id", datos.profesional_id)
    .single();

  const { data: ps } = await supabase
    .from("profesional_sucursales")
    .select("sucursal_id")
    .eq("profesional_id", datos.profesional_id)
    .eq("sucursal_id", sucursal.id)
    .eq("activo", true)
    .maybeSingle();

  const pertenece = Boolean(
    ps || (profesional && profesional.sucursal_id === sucursal.id),
  );

  if (!pertenece) {
    throw {
      status: 403,
      message: "El profesional no pertenece a tu sucursal.",
    };
  }

  const fechas: string[] = [];
  const actual = new Date(datos.fecha_inicio.replace(/-/g, "/"));
  const fin = new Date(datos.fecha_fin.replace(/-/g, "/"));
  while (actual <= fin) {
    fechas.push(actual.toISOString().slice(0, 10));
    actual.setDate(actual.getDate() + 1);
  }

  let turnosAfectados = 0;

  for (const fecha of fechas) {
    let queryTurnos = supabase
      .from("turnos")
      .select("id")
      .eq("profesional_id", datos.profesional_id)
      .eq("fecha", fecha)
      .in("estado", ["confirmado", "pendiente_reagendamiento"]);

    if (datos.hora_inicio && datos.hora_fin) {
      queryTurnos = queryTurnos
        .gte("hora_inicio", datos.hora_inicio)
        .lte("hora_fin", datos.hora_fin);
    }

    const { data: turnosEnRango } = await queryTurnos;

    if (turnosEnRango && turnosEnRango.length > 0) {
      const ids = turnosEnRango.map((t) => t.id);
      const { error: errUpdate } = await supabase
        .from("turnos")
        .update({ estado: "pendiente_reagendamiento" })
        .in("id", ids);

      if (errUpdate) throw errUpdate;
      turnosAfectados += ids.length;
    }

    // Insertar ausencia (día completo o rango de horas parcial)
    const ausencia = {
      profesional_id: datos.profesional_id,
      fecha,
      hora_inicio: datos.hora_inicio || null,
      hora_fin: datos.hora_fin || null,
      motivo: datos.motivo || "Bloqueo de agenda",
    };

    const { error: errInsert } = await supabase
      .from("profesional_ausencias")
      .insert([ausencia]);

    if (errInsert && errInsert.code !== "23505") throw errInsert;
  }

  await invalidarDatosTurnos();
  await invalidar(CLAVES.ausenciasGeneral);

  return {
    mensaje: "Horario bloqueado correctamente.",
    fechasAfectadas: fechas.length,
    turnosAfectados,
  };
};
