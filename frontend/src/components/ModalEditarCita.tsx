import { useState } from "react";
import {
  AlertCircle,
  CalendarCheck,
  CalendarX,
  Check,
  Clock,
  Edit3,
  Loader2,
  Phone,
  X,
} from "lucide-react";
import type { BookingEvent } from "../types";
import {
  actualizarEstadoTurno,
  cancelarTurno,
  reagendarTurnoAdmin,
} from "../store";
import { useToast } from "../contexts/toast";
import { mensajeDeError } from "../api/dto";

const MOTIVOS_SUGERIDOS = [
  "Cambio de planes del cliente",
  "Cliente no asistió",
  "Falla en el servicio",
  "Doble reserva",
  "Otro",
];

const formatearFecha = (iso: string): string => {
  if (!iso) return "—";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const esHoraValida = (hora: string): boolean =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

const colorDeEstado = (estado?: string): string => {
  switch (estado) {
    case "cancelado":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "completado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "no_asistio":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500";
    case "pendiente_pago":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
  }
};

const ETIQUETA_ESTADO: Record<string, string> = {
  confirmado: "Confirmado",
  pendiente_pago: "Pendiente de pago",
  cancelado: "Cancelado",
  completado: "Completado",
  no_asistio: "No asistió",
  reagendado: "Reagendado",
};

type AccionOcupada = "estado" | "reagendar" | "cancelar" | null;

interface Props {
  booking: BookingEvent;
  onClose: () => void;
}

export default function ModalEditarCita({ booking, onClose }: Props) {
  const { mostrarToast } = useToast();
  const estaCancelado = booking.estado === "cancelado";

  const [estadoSel, setEstadoSel] = useState<"completado" | "no_asistio">(
    "completado",
  );
  const [reagFecha, setReagFecha] = useState<string>(
    booking.fecha || new Date().toISOString().slice(0, 10),
  );
  const [reagHora, setReagHora] = useState<string>(booking.timeStart);
  const [motivo, setMotivo] = useState<string>("");
  const [ocupada, setOcupada] = useState<AccionOcupada>(null);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = async (
    accion: AccionOcupada,
    operacion: () => Promise<void>,
    exito: string,
  ) => {
    setOcupada(accion);
    setError(null);
    try {
      await operacion();
      mostrarToast(exito, "exito");
      onClose();
    } catch (err) {
      setError(
        mensajeDeError(err, "No se pudo completar la acción sobre el turno."),
      );
    } finally {
      setOcupada(null);
    }
  };

  const alCambiarEstado = () =>
    ejecutar(
      "estado",
      () => actualizarEstadoTurno(booking.id, estadoSel),
      estadoSel === "completado"
        ? `Turno de ${booking.clientName} marcado como completado.`
        : `Turno de ${booking.clientName} marcado como no asistió.`,
    );

  const alReagendar = () => {
    if (!reagFecha) {
      setError("Elegí una fecha para el reagendamiento.");
      return;
    }
    const hora = reagHora.trim();
    if (!esHoraValida(hora)) {
      setError("Indicá la nueva hora en formato HH:MM (ej. 14:30).");
      return;
    }
    return ejecutar(
      "reagendar",
      () => reagendarTurnoAdmin(booking.id, reagFecha, hora),
      `Turno de ${booking.clientName} reagendado correctamente.`,
    );
  };

  const alCancelar = () =>
    ejecutar(
      "cancelar",
      () => cancelarTurno(booking.id, motivo.trim() || undefined),
      `Turno de ${booking.clientName} cancelado correctamente.`,
    );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-cita-title"
        className="card w-full max-w-md space-y-4 p-6 shadow-2xl animate-scale-up"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
              <Edit3 size={18} />
            </div>
            <div>
              <h3
                id="editar-cita-title"
                className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                Detalles del Turno
              </h3>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorDeEstado(
                  booking.estado,
                )}`}
              >
                {ETIQUETA_ESTADO[booking.estado || ""] || "Sin estado"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={Boolean(ocupada)}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950/60">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {booking.clientName}
            </p>
            {booking.telefono && (
              <p className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <Phone size={11} />
                {booking.telefono}
              </p>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {booking.serviceName}
            {booking.profesionalNombre
              ? ` · ${booking.profesionalNombre}`
              : ""}{" "}
            {booking.precio !== undefined
              ? `· $${booking.precio.toLocaleString("es-AR")}`
              : ""}
          </p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <CalendarCheck size={12} className="text-indigo-400" />
            {formatearFecha(booking.fecha || "")} · {booking.timeStart} -{" "}
            {booking.timeEnd}
          </p>
          {booking.motivoCancelacion && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400">
              <AlertCircle size={11} />
              Cancelado
              {booking.canceladoPor
                ? ` (por ${booking.canceladoPor})`
                : ""}: {booking.motivoCancelacion}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {!estaCancelado && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check size={13} className="text-emerald-500" />
                <span className="label-overline">Cambiar estado</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={estadoSel}
                  onChange={(e) =>
                    setEstadoSel(e.target.value as "completado" | "no_asistio")
                  }
                  disabled={Boolean(ocupada)}
                  className="input flex-1 text-[11px]"
                >
                  <option value="completado">Completado</option>
                  <option value="no_asistio">No asistió</option>
                </select>
                <button
                  type="button"
                  onClick={alCambiarEstado}
                  disabled={Boolean(ocupada)}
                  className="btn btn-primary px-3 py-2 text-[11px]"
                >
                  {ocupada === "estado" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarCheck size={13} className="text-indigo-500" />
                <span className="label-overline">Reagendar</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={reagFecha}
                  onChange={(e) => setReagFecha(e.target.value)}
                  disabled={Boolean(ocupada)}
                  className="input flex-1 text-[11px]"
                  aria-label="Nueva fecha"
                />
                <input
                  type="text"
                  value={reagHora}
                  onChange={(e) => setReagHora(e.target.value)}
                  placeholder="14:30"
                  disabled={Boolean(ocupada)}
                  className="input w-20 text-[11px] font-mono"
                  aria-label="Nueva hora"
                />
                <button
                  type="button"
                  onClick={alReagendar}
                  disabled={Boolean(ocupada)}
                  className="btn btn-primary px-3 py-2 text-[11px]"
                >
                  {ocupada === "reagendar" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Reagendar"
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Hora en formato HH:MM, según la jornada del profesional.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarX size={13} className="text-red-500" />
                <span className="label-overline">Cancelar turno</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  disabled={Boolean(ocupada)}
                  className="input flex-1 text-[11px]"
                >
                  <option value="">Motivo (opcional)</option>
                  {MOTIVOS_SUGERIDOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={alCancelar}
                  disabled={Boolean(ocupada)}
                  className="btn btn-danger px-3 py-2 text-[11px]"
                >
                  {ocupada === "cancelar" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Cancelar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {estaCancelado && (
          <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <Clock size={13} /> Este turno está cancelado: no se puede modificar
            ni reagendar.
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1 py-2.5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
