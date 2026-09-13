import { supabase } from "../config/database.js";
import { resolverSucursalDeUsuarioService } from "./negocios.service.js";

interface CrearTurnoInput {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}

interface ConsultarDisponibilidadInput {
  profesional_id: string;
  fecha: string;
}

// Arma un Date consistente a partir de una fecha y una hora con o sin segundos
const aFechaHora = (fecha: string, hora: string): Date => {
  const segundos = hora.split(":").length === 3 ? hora : `${hora}:00`;
  return new Date(`${fecha}T${segundos}Z`);
};

export const crearTurnoService = async (datos: CrearTurnoInput) => {
  const { cliente_id, profesional_id, servicio_id, fecha, hora_inicio } = datos;

  // Obtener la duración del servicio para calcular la hora_fin
  const { data: servicio, error: errorServicio } = await supabase
    .from("servicios")
    .select("duracion_minutos, precio")
    .eq("id", servicio_id)
    .single();

  if (errorServicio || !servicio) {
    throw { status: 404, message: "El servicio solicitado no existe." };
  }

  // Calcular hora_fin basándonos en la duración
  const [horas, minutos, segundos] = hora_inicio.split(":").map(Number);
  const fechaBase = new Date(2026, 0, 1, horas, minutos, segundos || 0);
  fechaBase.setMinutes(fechaBase.getMinutes() + servicio.duracion_minutos);
  const hora_fin = fechaBase.toTimeString().split(" ")[0];

  // El profesional no puede recibir reservas en días/horas con ausencia
  const { data: ausencias, error: errorAusencias } = await supabase
    .from("profesional_ausencias")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", profesional_id)
    .eq("fecha", fecha);

  if (errorAusencias) throw errorAusencias;

  const inicioReserva = aFechaHora(fecha, hora_inicio);
  const finReserva = aFechaHora(fecha, hora_fin);

  const bloqueado = (ausencias || []).some((a) => {
    // Ausencia de día completo
    if (!a.hora_inicio || !a.hora_fin) return true;
    // Ausencia parcial: se solapa con el rango solicitado
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

  // Insertar el turno en la base de datos
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
      },
    ])
    .select()
    .single();

  if (errorTurno) {
    // Si el índice GIST de exclusión salta por solapamiento
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

  return { ...nuevoTurno };
};

export const limpiarTurnosExpiradosService = async (
  minutosLimite: number = 15,
) => {
  // Calcular el umbral de tiempo hacia atras
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - minutosLimite);
  const tiempoLimiteISO = ahora.toISOString();

  // Atualizar en Supabase todos los turnos que cumplan que:
  // Su estado sea 'pendiente_pago'
  // Fueron creados ANTES del tiempo límite calculado

  const { data, error, count } = await supabase
    .from("turnos")
    .update({ estado: "expirado" })
    .eq("estado", "pendiente_pago")
    .lt("created_at", tiempoLimiteISO)
    .select("id");

  if (error) {
    throw error;
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

  // Averiguar qué día de la semana es la fecha consultada (0 = Domingo, 6 = Sábado)
  // Usar un reemplazo de guiones para evitar desfases de zona horaria en Node
  const numeroDiaSemana = new Date(fecha.replace(/-/g, "/")).getDay();

  // Consultar la disponibilidad del profesional
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

  // Ausencia de día completo: el profesional no atiende esa fecha
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

  // Franjas de ausencia parcial dentro del día (bloques a mostrar como ocupados)
  const { data: ausenciasParciales, error: errorAusParcial } = await supabase
    .from("profesional_ausencias")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", profesional_id)
    .eq("fecha", fecha)
    .not("hora_inicio", "is", null);

  if (errorAusParcial) throw errorAusParcial;

  // Traer los turnos que YA están ocupados (confirmados o pendientes de pago) para ese día

  const { data: turnosOcupados, error: errorTurnos } = await supabase
    .from("turnos")
    .select("hora_inicio, hora_fin")
    .eq("profesional_id", profesional_id)
    .eq("fecha", fecha)
    .in("estado", ["confirmado", "pendiente_pago"]);

  if (errorTurnos) throw errorTurnos;

  // Retornamos el rango de atención y los bloques que están bloqueados
  // Para que el frontend o el backend puedan mapear visualmente los huecos

  return {
    fecha,
    jornadaLaboral: {
      inicio: horarioLaboral.hora_inicio,
      fin: horarioLaboral.hora_fin,
    },
    bloquesOcupados: [...(turnosOcupados || []), ...(ausenciasParciales || [])],
  };
};

// Historial de reservas del cliente autenticado (PWA -> /turnos/mios)
export const listarTurnosClienteService = async (usuarioId: string) => {
  const { data: turnos, error } = await supabase
    .from("turnos")
    .select(
      `
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        created_at,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .eq("cliente_id", usuarioId)
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: false });

  if (error) throw error;

  return turnos || [];
};

// Cancela un turno propio del cliente: valida propiedad y cambia el estado
export const cancelarTurnoClienteService = async (
  usuarioId: string,
  turnoId: string,
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
    .update({ estado: "cancelado" })
    .eq("id", turnoId)
    .select(
      `
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (error) {
    throw { status: 400, message: "No se pudo actualizar el turno." };
  }

  return actualizado;
};

// Agenda de la sucursal para el Calendario Maestro (panel admin)
export const listarTurnosAdminService = async (sucursalId: string) => {
  const { data: turnos, error } = await supabase
    .from("turnos")
    .select(
      `
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        created_at,
        clientes:cliente_id (id, nombre, telefono),
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, sucursal_id, usuarios:usuario_id (nombre))
      `,
    )
    .eq("profesionales.sucursal_id", sucursalId)
    .order("hora_inicio", { ascending: true });

  if (error) throw error;
  return turnos || [];
};

// Cancela un turno con rol admin: valida que pertenezca a la sucursal del usuario
export const cancelarTurnoAdminService = async (
  usuarioId: string,
  turnoId: string,
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
    .select("id, estado, profesionales:profesional_id (id, sucursal_id)")
    .eq("id", turnoId)
    .single();

  if (errorBusqueda || !turno) {
    throw { status: 404, message: "El turno solicitado no existe." };
  }

  const profesional = Array.isArray(turno.profesionales)
    ? turno.profesionales[0]
    : turno.profesionales;

  if (!profesional || profesional.sucursal_id !== sucursal.id) {
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
    .update({ estado: "cancelado" })
    .eq("id", turnoId)
    .select(
      `
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        servicios:servicio_id (nombre, precio, duracion_minutos),
        profesionales:profesional_id (id, especialidad, usuarios:usuario_id (nombre))
      `,
    )
    .single();

  if (error) {
    throw { status: 400, message: "No se pudo actualizar el turno." };
  }

  return actualizado;
};
