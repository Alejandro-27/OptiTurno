import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX2,
  Clock,
  Loader2,
  Scissors,
  AlertCircle,
  CalendarCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  cancelarTurnoCliente,
  reagendarTurnoCliente,
  cargarMisTurnos,
  useStore,
} from "../store";
import type { MisTurnoDTO } from "../api/dto";
import { mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";
import EmptyState from "./EmptyState";
import TurnoCardSkeleton from "./skeletons/TurnoCardSkeleton";
import ConfirmarCancelacionModal from "./ConfirmarCancelacionModal";
import PendingRescheduleBanner from "./PendingRescheduleBanner";

const ESTADOS: Record<string, { etiqueta: string; clase: string }> = {
  pendiente_pago: {
    etiqueta: "Pago pendiente",
    clase: "badge badge-warning",
  },
  confirmado: {
    etiqueta: "Confirmado",
    clase: "badge badge-success",
  },
  cancelado: {
    etiqueta: "Cancelado",
    clase: "badge badge-danger",
  },
  reagendado: {
    etiqueta: "Reagendado",
    clase: "badge badge-neutral",
  },
  pendiente_reagendamiento: {
    etiqueta: "Reprogramar",
    clase: "badge badge-warning",
  },
  completado: {
    etiqueta: "Completado",
    clase: "badge badge-neutral",
  },
  no_asistio: {
    etiqueta: "No asistió",
    clase: "badge badge-danger",
  },
};

const formatearFecha = (iso: string): string => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatearHora = (hora: string): string => hora.slice(0, 5);

export default function MisTurnosView() {
  const misTurnos = useStore((s) => s.misTurnos);
  const cargando = useStore((s) => s.misTurnosCargando);
  const { mostrarToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [turnoConfirmar, setTurnoConfirmar] = useState<MisTurnoDTO | null>(
    null,
  );
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [turnoReagendar, setTurnoReagendar] = useState<MisTurnoDTO | null>(
    null,
  );
  const [turnosIgnorados, setTurnosIgnorados] = useState<string[]>([]);

  const cargar = () => {
    setError(null);
    cargarMisTurnos().catch((err) =>
      setError(mensajeDeError(err, "Error al cargar tus turnos.")),
    );
  };

  useEffect(() => {
    cargar();
  }, []);

  const solicitarCancelacion = (turno: MisTurnoDTO) => {
    setError(null);
    setMotivoCancelacion("");
    setTurnoConfirmar(turno);
  };

  const confirmarCancelacion = async () => {
    if (!turnoConfirmar) return;
    setCancelando(turnoConfirmar.id);
    setError(null);
    try {
      await cancelarTurnoCliente(
        turnoConfirmar.id,
        motivoCancelacion || undefined,
      );
      mostrarToast("Cita cancelada correctamente.", "exito");
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo cancelar el turno."));
    } finally {
      setCancelando(null);
      setTurnoConfirmar(null);
      setMotivoCancelacion("");
    }
  };

  const handleReagendar = async (nuevaFecha: string, nuevaHora: string) => {
    if (!turnoReagendar) return;
    try {
      await reagendarTurnoCliente(turnoReagendar.id, nuevaFecha, nuevaHora);
      mostrarToast("Cita reagendada correctamente.", "exito");
      setTurnoReagendar(null);
    } catch (err) {
      mostrarToast(
        mensajeDeError(err, "No se pudo reagendar el turno."),
        "error",
      );
    }
  };

  const turnosPendientesReagendamiento = misTurnos.filter(
    (t) =>
      t.estado === "pendiente_reagendamiento" &&
      !turnosIgnorados.includes(t.id),
  );

  const turnosActivos = misTurnos.filter(
    (t) =>
      t.estado !== "cancelado" &&
      t.estado !== "reagendado" &&
      t.estado !== "pendiente_reagendamiento",
  );

  const turnosHistorial = misTurnos.filter(
    (t) =>
      t.estado === "cancelado" ||
      t.estado === "reagendado" ||
      t.estado === "completado" ||
      t.estado === "no_asistio",
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p className="font-semibold leading-snug">{error}</p>
          <button
            onClick={cargar}
            className="label-overline ml-auto text-red-600 hover:underline dark:text-red-400"
          >
            Reintentar
          </button>
        </div>
      )}

      {turnosPendientesReagendamiento.length > 0 && (
        <PendingRescheduleBanner
          turnos={turnosPendientesReagendamiento}
          onReagendar={handleReagendar}
          onCerrar={(id) => {
            setTurnosIgnorados((prev) => [...prev, id]);
          }}
        />
      )}

      {cargando && misTurnos.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          <TurnoCardSkeleton />
          <TurnoCardSkeleton />
          <TurnoCardSkeleton />
        </div>
      ) : misTurnos.length === 0 ? (
        <EmptyState
          icono={CalendarX2}
          titulo="Aún no tienes turnos reservados"
          descripcion={
            'Ve a "Reservar Cita" y agenda tu primer turno en segundos.'
          }
          accion={
            <Link to="/reservar" className="btn btn-primary px-5 py-2.5">
              Reservar Cita
            </Link>
          }
        />
      ) : (
        <>
          {turnosActivos.length > 0 && (
            <div className="space-y-3">
              {turnosActivos.map((turno) => {
                const estado = ESTADOS[turno.estado] || ESTADOS.completado;
                return (
                  <div key={turno.id} className="card space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-600/15 dark:text-indigo-400">
                          <Scissors size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            {turno.servicios?.nombre || "Servicio"}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {turno.profesionales?.usuarios.nombre ||
                              "Profesional"}{" "}
                            ·{" "}
                            {turno.profesionales?.especialidad ||
                              "Especialidad"}
                          </p>
                        </div>
                      </div>
                      <span className={`${estado.clase} flex-shrink-0`}>
                        {estado.etiqueta}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <CalendarCheck size={12} className="text-emerald-600" />
                        {formatearFecha(turno.fecha)}
                      </span>
                      <span className="flex items-center gap-1 font-mono font-semibold">
                        <Clock size={12} className="text-indigo-600" />
                        {formatearHora(turno.hora_inicio)} -{" "}
                        {formatearHora(turno.hora_fin)}
                      </span>
                      <span className="ml-auto font-mono font-bold text-slate-800 dark:text-slate-200">
                        $
                        {(turno.servicios?.precio || 0).toLocaleString("es-CO")}{" "}
                        COP
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => setTurnoReagendar(turno)}
                        disabled={cancelando === turno.id}
                        className="btn btn-ghost gap-1.5 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700 px-2.5 py-1.5 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <RefreshCw size={11} />
                        Reagendar
                      </button>
                      <button
                        onClick={() => solicitarCancelacion(turno)}
                        disabled={cancelando === turno.id}
                        className="btn btn-ghost gap-1.5 text-red-600 hover:bg-red-500/10 hover:text-red-700 px-2.5 py-1.5 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {cancelando === turno.id && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {turnosHistorial.length > 0 && (
            <div className="mt-6">
              <h3 className="label-overline mb-3 text-slate-400 dark:text-slate-500">
                Historial
              </h3>
              <div className="space-y-3">
                {turnosHistorial.map((turno) => {
                  const estado = ESTADOS[turno.estado] || ESTADOS.completado;
                  const esCancelado = turno.estado === "cancelado";
                  return (
                    <div
                      key={turno.id}
                      className={`card space-y-3 p-4 transition-opacity ${
                        esCancelado ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-600/15 dark:text-indigo-400">
                            <Scissors size={16} />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              {turno.servicios?.nombre || "Servicio"}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {turno.profesionales?.usuarios.nombre ||
                                "Profesional"}{" "}
                              ·{" "}
                              {turno.profesionales?.especialidad ||
                                "Especialidad"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`${estado.clase} flex-shrink-0 ${
                            esCancelado ? "line-through" : ""
                          }`}
                        >
                          {estado.etiqueta}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 font-semibold">
                          <CalendarCheck
                            size={12}
                            className="text-emerald-600"
                          />
                          {formatearFecha(turno.fecha)}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-semibold">
                          <Clock size={12} className="text-indigo-600" />
                          {formatearHora(turno.hora_inicio)} -{" "}
                          {formatearHora(turno.hora_fin)}
                        </span>
                        <span className="ml-auto font-mono font-bold text-slate-800 dark:text-slate-200">
                          $
                          {(turno.servicios?.precio || 0).toLocaleString(
                            "es-CO",
                          )}{" "}
                          COP
                        </span>
                      </div>

                      {turno.motivo_cancelacion && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] text-amber-700 dark:text-amber-400">
                          <AlertTriangle
                            size={12}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span>
                            <strong>Motivo:</strong> {turno.motivo_cancelacion}
                            {turno.cancelado_por && (
                              <> · Cancelado por {turno.cancelado_por}</>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmarCancelacionModal
        turno={turnoConfirmar}
        cancelando={cancelando !== null}
        error={error}
        motivo={motivoCancelacion}
        onMotivoChange={setMotivoCancelacion}
        onClose={() => setTurnoConfirmar(null)}
        onConfirmar={confirmarCancelacion}
      />

      {turnoReagendar && (
        <ReagendarModal
          turno={turnoReagendar}
          onClose={() => setTurnoReagendar(null)}
          onConfirmar={handleReagendar}
        />
      )}
    </div>
  );
}

function ReagendarModal({
  turno,
  onClose,
  onConfirmar,
}: {
  turno: MisTurnoDTO;
  onClose: () => void;
  onConfirmar: (fecha: string, hora: string) => Promise<void>;
}) {
  const [fecha, setFecha] = useState(turno.fecha);
  const [hora, setHora] = useState(turno.hora_inicio.slice(0, 5));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      await onConfirmar(fecha, hora);
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo reagendar."));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reagendar-turno-title"
        className="card w-full max-w-sm space-y-4 p-6 shadow-2xl animate-scale-up"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3
                id="reagendar-turno-title"
                className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                Reagendar turno
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selecciona la nueva fecha y hora.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={cargando}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950/60">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {turno.servicios?.nombre || "Servicio"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Actual: {formatearFecha(turno.fecha)} ·{" "}
            {formatearHora(turno.hora_inicio)}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-overline mb-1 block">Nueva fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input w-full"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="label-overline mb-1 block">Nueva hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-600 dark:text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="btn btn-secondary flex-1 py-2.5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={cargando}
            className="btn btn-primary flex-1 py-2.5"
          >
            {cargando && <Loader2 size={12} className="animate-spin" />}
            {cargando ? "Reagendando..." : "Reagendar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
