import { supabase } from "../config/database";
import { configWhatsApp, whatsappHabilitado } from "../config/whatsapp";
import { enviarTextoWhatsApp, normalizarTelefono } from "./whatsapp.service";

/**
 * Recordatorios automáticos por WhatsApp vía Evolution API.
 *
 * Flujo por cada turno candidato:
 *  1. Se calcula la fecha objetivo desde la ventana (24h -> mañana, 2h -> hoy).
 *  2. Se filtran los turnos `confirmado` de esa fecha con teléfono del cliente.
 *  3. Se consulta `notificaciones` para no repetir la misma (turno, ventana):
 *     - `enviado`        -> se omite (idempotencia).
 *     - `fallido` y intentos agotados -> se omite.
 *  4. Se reclama la fila (estado `pendiente`, intentos + 1) y se envía.
 *  5. Se marca `enviado` o `fallido` con el error. Nunca se lanza hacia el cron:
 *     un contenedor apagado o un turno malo no pueden tumbar el backend.
 */

interface LoggerLike {
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
}

interface TurnoCandidato {
  id: string;
  fecha: string;
  hora_inicio: string;
  cliente: { nombre: string; telefono: string | null } | null;
  servicios: { nombre: string } | null;
}

type EstadoNotificacion = "pendiente" | "enviado" | "fallido";

interface NotificacionExistente {
  turno_id: string;
  estado: EstadoNotificacion;
  intentos: number;
}

export interface ResumenRecordatorios {
  fecha_objetivo: string;
  ventana_horas: number;
  candidatos: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
}

const logVacio: LoggerLike = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

/** Fecha (YYYY-MM-DD) del "hoy" en la zona horaria configurada. */
const fechaEnZona = (zona: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/** Suma días a una fecha YYYY-MM-DD sin pasar por la zona horaria del server. */
const sumarDias = (fechaISO: string, dias: number): string => {
  const base = new Date(`${fechaISO}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
};

/** 2026-03-05 -> 05/03/2026 (formato local de Colombia). */
const formatearFecha = (fechaISO: string): string => {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatearHora = (hora: string): string => hora.slice(0, 5);

const construirMensaje = (turno: TurnoCandidato): string => {
  const nombre = (turno.cliente?.nombre || "").trim().split(" ")[0] || "Hola";
  const servicio = turno.servicios?.nombre || "tu servicio";
  return [
    `Hola ${nombre}, te recordamos tu cita de ${servicio}`,
    `el ${formatearFecha(turno.fecha)} a las ${formatearHora(turno.hora_inicio)}.`,
    "¿Nos confirmas? Si necesitas reprogramar, escríbenos por este medio.",
  ].join(" ");
};

/** Marca la notificación como enviada/fallida (upsert por la clave única). */
const registrarResultado = async (
  turnoId: string,
  ventana: number,
  destino: string | null,
  mensaje: string,
  resultado: { ok: boolean; error?: string; intentos: number },
): Promise<void> => {
  const { error } = await supabase.from("notificaciones").upsert(
    {
      turno_id: turnoId,
      ventana_horas: ventana,
      canal: "whatsapp",
      estado: resultado.ok ? "enviado" : "fallido",
      intentos: resultado.intentos,
      destinatario: destino,
      mensaje,
      error: resultado.ok ? null : (resultado.error ?? "Error desconocido."),
      enviado_en: resultado.ok ? new Date().toISOString() : null,
    },
    { onConflict: "turno_id,ventana_horas" },
  );
  if (error) {
    // Si ni siquiera podemos registrar el fallo, el cron tampoco debe morir.
    console.error("No se pudo registrar la notificación:", error.message);
  }
};

/** Procesa una ventana concreta. Devuelve el resumen para logs y endpoint. */
const procesarVentana = async (
  ventana: number,
  logger: LoggerLike,
): Promise<ResumenRecordatorios> => {
  // 24h -> mañana; 2h -> hoy (se redondea a días completos).
  const dias = Math.round(ventana / 24);
  const fechaObjetivo = sumarDias(
    fechaEnZona(configWhatsApp.zonaHoraria),
    dias,
  );
  const resumen: ResumenRecordatorios = {
    fecha_objetivo: fechaObjetivo,
    ventana_horas: ventana,
    candidatos: 0,
    enviados: 0,
    fallidos: 0,
    omitidos: 0,
  };

  const { data, error } = await supabase
    .from("turnos")
    .select(
      "id, fecha, hora_inicio, cliente:cliente_id (nombre, telefono), servicios:servicio_id (nombre)",
    )
    .eq("fecha", fechaObjetivo)
    .eq("estado", "confirmado")
    .order("hora_inicio", { ascending: true });

  if (error) {
    logger.error(
      { err: error.message },
      `No se pudieron leer los turnos del ${fechaObjetivo}`,
    );
    return resumen;
  }

  let turnos = (data ?? []) as unknown as TurnoCandidato[];

  // Para ventanas intra-día (ej. 2 horas), filtrar solo las citas en ese rango horario
  if (ventana < 24) {
    const formateador = new Intl.DateTimeFormat("en-US", {
      timeZone: configWhatsApp.zonaHoraria,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const partes = formateador.formatToParts(new Date());
    const hActual = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
    const mActual = Number(partes.find((p) => p.type === "minute")?.value ?? 0);
    const minutosAhora = hActual * 60 + mActual;
    const minutosObjetivo = minutosAhora + ventana * 60;

    turnos = turnos.filter((t) => {
      const [th = 0, tm = 0] = t.hora_inicio.split(":").map(Number);
      const minutosTurno = th * 60 + tm;
      // Tolerancia: citas que caigan en la ventana (+/- 30 min)
      return (
        minutosTurno >= minutosObjetivo - 30 &&
        minutosTurno <= minutosObjetivo + 30
      );
    });
  }

  resumen.candidatos = turnos.length;
  if (turnos.length === 0) return resumen;

  const { data: existentes, error: errorExistentes } = await supabase
    .from("notificaciones")
    .select("turno_id, estado, intentos")
    .eq("ventana_horas", ventana)
    .in(
      "turno_id",
      turnos.map((t) => t.id),
    );

  if (errorExistentes) {
    logger.error(
      { err: errorExistentes.message },
      "No se pudieron leer las notificaciones previas",
    );
    return resumen;
  }

  const yaProcesados = new Map<string, NotificacionExistente>(
    ((existentes ?? []) as unknown as NotificacionExistente[]).map((n) => [
      n.turno_id,
      n,
    ]),
  );

  for (const turno of turnos) {
    const previa = yaProcesados.get(turno.id);
    if (previa?.estado === "enviado") {
      resumen.omitidos++;
      continue;
    }
    const intentosPrevios = previa?.intentos ?? 0;
    if (
      previa?.estado === "fallido" &&
      intentosPrevios >= configWhatsApp.maxIntentos
    ) {
      resumen.omitidos++;
      continue;
    }

    const telefono = normalizarTelefono(turno.cliente?.telefono ?? null);
    const mensaje = construirMensaje(turno);

    if (!telefono) {
      // Dato del cliente, no un fallo de red: no tiene sentido reintentar.
      logger.warn(
        { turno_id: turno.id },
        "Recordatorio omitido: el cliente no tiene teléfono registrado",
      );
      await registrarResultado(turno.id, ventana, null, mensaje, {
        ok: false,
        error: "El cliente no tiene teléfono registrado.",
        intentos: configWhatsApp.maxIntentos,
      });
      resumen.fallidos++;
      continue;
    }

    const intentos = intentosPrevios + 1;
    const resultado = await enviarTextoWhatsApp(telefono, mensaje);

    await registrarResultado(turno.id, ventana, telefono, mensaje, {
      ok: resultado.ok,
      error: resultado.error,
      intentos,
    });

    if (resultado.ok) {
      resumen.enviados++;
      logger.info(
        { turno_id: turno.id, ventana },
        "Recordatorio enviado por WhatsApp",
      );
    } else {
      resumen.fallidos++;
      logger.error(
        { turno_id: turno.id, ventana, intentos, err: resultado.error },
        "Falló el envío del recordatorio por WhatsApp",
      );
    }
  }

  return resumen;
};

/**
 * Ejecuta todas las ventanas configuradas. Es la entrada del cron y del
 * endpoint manual: siempre resuelve, nunca propaga errores.
 */
export const procesarRecordatoriosService = async (
  logger: LoggerLike = logVacio,
): Promise<ResumenRecordatorios[]> => {
  if (!whatsappHabilitado()) {
    logger.warn(
      {},
      "Recordatorios de WhatsApp desactivados: falta WHATSAPP_API_KEY en el entorno",
    );
    return [];
  }

  const resúmenes: ResumenRecordatorios[] = [];
  for (const ventana of configWhatsApp.ventanas) {
    try {
      const resumen = await procesarVentana(ventana, logger);
      resúmenes.push(resumen);
      logger.info(
        resumen,
        `Recordatorios ${ventana}h → fecha ${resumen.fecha_objetivo}: ${resumen.enviados} enviados, ${resumen.fallidos} fallidos, ${resumen.omitidos} omitidos`,
      );
    } catch (error) {
      // Redondeo defensivo: una ventana rota no debe cortar las demás.
      logger.error(
        {
          ventana,
          err: error instanceof Error ? error.message : String(error),
        },
        "Error inesperado procesando recordatorios",
      );
    }
  }
  return resúmenes;
};
