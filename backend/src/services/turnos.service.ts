import { supabase } from "../config/database.js";

interface CrearTurnoInput {
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
}

export const crearTurnoService = async (datos: CrearTurnoInput) => {
  const { cliente_id, profesional_id, servicio_id, fecha, hora_inicio } = datos;

  // Obtener la duración del servicio para calcular la hora_fin
  const { data: servicio, error: errorServicio } = await supabase
    .from("servicios")
    .select("duracion_minutos")
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
        estado: "pendiente_pago",
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

  return nuevoTurno;
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

interface ConsultarDisponibilidadInput {
  profesional_id: string;
  fecha: string;
}

export const consultarDisponibilidadService = async (
  datos: ConsultarDisponibilidadInput,
) => {
  const { profesional_id, fecha } = datos;

  // Averiguar qué día de la semana es la fecha consultada (0 = Domingo, 6 = Sábado)
  // Usar un reemplazo de guiones para evitar desfases de zona horaria en Node
  const numeroDiaSemana = new Date(fecha.replace(/-/g, "\/")).getDay();

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
    bloquesOcupados: turnosOcupados || [],
  };
};
