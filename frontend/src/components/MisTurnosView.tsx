import React, { useEffect, useState } from "react";
import {
  CalendarX2,
  Clock,
  Loader2,
  Scissors,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import { cancelarTurnoCliente, cargarMisTurnos, useStore } from "../store";

const ESTADOS: Record<string, { etiqueta: string; clase: string }> = {
  pendiente_pago: {
    etiqueta: "Pago pendiente",
    clase: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  },
  confirmado: {
    etiqueta: "Confirmado",
    clase: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  },
  cancelado: {
    etiqueta: "Cancelado",
    clase: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
  },
  completado: {
    etiqueta: "Completado",
    clase: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25",
  },
};

const formatearFecha = (iso: string): string => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatearHora = (hora: string): string =>
  hora.slice(0, 5);

export default function MisTurnosView() {
  const misTurnos = useStore((s) => s.misTurnos);
  const cargando = useStore((s) => s.misTurnosCargando);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  const cargar = () => {
    setError(null);
    cargarMisTurnos().catch((err) =>
      setError(err instanceof Error ? err.message : "Error al cargar turnos."),
    );
  };

  useEffect(() => {
    cargar();
  }, []);

  const cancelarTurno = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas cancelar este turno?")) return;
    setCancelando(id);
    setError(null);
    try {
      await cancelarTurnoCliente(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar el turno.",
      );
    } finally {
      setCancelando(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-[11px]">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p className="font-semibold leading-snug">{error}</p>
          <button
            onClick={cargar}
            className="ml-auto text-[10px] font-bold uppercase tracking-wider hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && misTurnos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-xs font-semibold">Cargando tus turnos...</p>
        </div>
      ) : misTurnos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
          <CalendarX2 size={32} className="text-slate-400 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Aún no tienes turnos reservados
          </p>
          <p className="text-xs max-w-xs text-center leading-relaxed">
            Ve a "Reservar Cita" y agenda tu primer turno en segundos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {misTurnos.map((turno) => {
            const estado =
              ESTADOS[turno.estado] ||
              ESTADOS.completado;
            const cancelado = turno.estado === "cancelado";
            return (
              <div
                key={turno.id}
                className={`bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transition-opacity ${
                  cancelado ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                      <Scissors size={13} className="text-indigo-500" />
                      {turno.servicios?.nombre || "Servicio"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {turno.profesionales?.usuarios.nombre || "Profesional"} ·{" "}
                      {turno.profesionales?.especialidad || "Especialidad"}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      cancelado ? "line-through" : ""
                    } ${estado.clase}`}
                  >
                    {estado.etiqueta}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <CalendarCheck size={12} className="text-emerald-500" />
                    {formatearFecha(turno.fecha)}
                  </span>
                  <span className="flex items-center gap-1 font-semibold font-mono">
                    <Clock size={12} className="text-indigo-500" />
                    {formatearHora(turno.hora_inicio)} -{" "}
                    {formatearHora(turno.hora_fin)}
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200 ml-auto">
                    ${(turno.servicios?.precio || 0).toLocaleString("es-CO")} COP
                  </span>
                </div>

                {!cancelado && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => cancelarTurno(turno.id)}
                      disabled={cancelando === turno.id}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {cancelando === turno.id && (
                        <Loader2 size={11} className="animate-spin" />
                      )}
                      Cancelar Turno
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}