import { supabase } from "../config/database";
import { CLAVES, invalidar, leerConCache } from "../config/cache";

export interface CrearAusenciaInput {
  profesional_id: string;
  fecha: string;
  fecha_hasta?: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo?: string;
}

// Resuelve el vínculo 'profesionales' de un usuario autenticado.
// Devuelve null si la cuenta no es un profesional de alguna sucursal.
export const resolverProfesionalDeUsuarioService = async (
  usuarioId: string,
) => {
  const { data, error } = await supabase
    .from("profesionales")
    .select("id, sucursal_id")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Lista las ausencias de un profesional ordenadas por fecha (ascendente)
// Caché 2 min por profesional; afecta además a la disponibilidad (CLAVES.dispGeneral).
export const listarAusenciasService = async (profesionalId: string) =>
  leerConCache(CLAVES.ausencias(profesionalId), 120, async () => {
    const { data, error } = await supabase
      .from("profesional_ausencias")
      .select("*")
      .eq("profesional_id", profesionalId)
      .order("fecha", { ascending: true });

    if (error) throw error;
    return data || [];
  });

// Crea una o varias ausencias: una por día en el rango [fecha, fecha_hasta].
// - Sin horas  -> día completo (el profesional no atiende).
// - Con horas  -> franja dentro del día (bloque ocupado en la agenda).
export const crearAusenciasService = async (input: CrearAusenciaInput) => {
  const { profesional_id, fecha, fecha_hasta, hora_inicio, hora_fin, motivo } =
    input;

  if (!profesional_id || !fecha) {
    throw { status: 400, message: "Faltan campos obligatorios." };
  }

  if ((hora_inicio && !hora_fin) || (!hora_inicio && hora_fin)) {
    throw {
      status: 400,
      message:
        "Indica la hora de inicio y de fin, o deja la ausencia por todo el día.",
    };
  }

  // Expandir el rango de fechas (una fila por día, útil para vacaciones)
  const dias = [fecha];
  if (fecha_hasta) {
    const inicio = new Date(`${fecha}T00:00:00Z`);
    const fin = new Date(`${fecha_hasta}T00:00:00Z`);
    if (fin < inicio) {
      throw {
        status: 400,
        message: "La fecha final no puede ser anterior a la inicial.",
      };
    }
    const actual = new Date(inicio);
    while (actual < fin) {
      actual.setUTCDate(actual.getUTCDate() + 1);
      dias.push(actual.toISOString().slice(0, 10));
    }
  }

  const filas = dias.map((d) => ({
    profesional_id,
    fecha: d,
    hora_inicio: hora_inicio || null,
    hora_fin: hora_fin || null,
    motivo: motivo || "Ausencia personal",
  }));

  const { data, error } = await supabase
    .from("profesional_ausencias")
    .insert(filas)
    .select();

  if (error) {
    if (error.code === "23505") {
      throw {
        status: 409,
        message: "Ya existe una ausencia para alguna de las fechas indicadas.",
      };
    }
    throw error;
  }

  // Las ausencias bloquean franjas en la disponibilidad y en la agenda.
  await invalidar(CLAVES.ausenciasGeneral, CLAVES.dispGeneral);
  if (input.profesional_id) {
    await invalidar(CLAVES.ausencias(input.profesional_id));
  }

  return data || [];
};

// Elimina una ausencia. Solo el profesional propietario o un superadmin.
export const eliminarAusenciaService = async (
  ausenciaId: string,
  usuarioId: string,
  rol: string,
) => {
  const { data: ausencia, error: errBusqueda } = await supabase
    .from("profesional_ausencias")
    .select("id, profesional_id")
    .eq("id", ausenciaId)
    .maybeSingle();

  if (errBusqueda) throw errBusqueda;
  if (!ausencia) throw { status: 404, message: "La ausencia no existe." };

  if (rol !== "superadmin") {
    const profesional = await resolverProfesionalDeUsuarioService(usuarioId);
    if (!profesional || profesional.id !== ausencia.profesional_id) {
      throw {
        status: 403,
        message: "No tienes permiso para eliminar esta ausencia.",
      };
    }
  }

  const { error } = await supabase
    .from("profesional_ausencias")
    .delete()
    .eq("id", ausenciaId);

  if (error) throw error;

  await invalidar(CLAVES.ausenciasGeneral, CLAVES.dispGeneral);
  await invalidar(CLAVES.ausencias(ausencia.profesional_id));

  return { id: ausenciaId, eliminado: true };
};
