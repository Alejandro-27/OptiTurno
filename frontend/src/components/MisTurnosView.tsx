import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX2,
  Clock,
  Loader2,
  Scissors,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import { cancelarTurnoCliente, cargarMisTurnos, useStore } from "../store";
import type { MisTurnoDTO } from "../api/dto";
import { mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";
import EmptyState from "./EmptyState";
import TurnoCardSkeleton from "./skeletons/TurnoCardSkeleton";
import ConfirmarCancelacionModal from "./ConfirmarCancelacionModal";

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
  completado: {
    etiqueta: "Completado",
    clase: "badge badge-neutral",
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
    setTurnoConfirmar(turno);
  };

  const confirmarCancelacion = async () => {
    if (!turnoConfirmar) return;
    setCancelando(turnoConfirmar.id);
    setError(null);
    try {
      await cancelarTurnoCliente(turnoConfirmar.id);
      mostrarToast("Cita cancelada correctamente.", "exito");
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo cancelar el turno."));
    } finally {
      setCancelando(null);
      setTurnoConfirmar(null);
    }
  };

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
        <div className="space-y-3">
          {misTurnos.map((turno) => {
            const estado = ESTADOS[turno.estado] || ESTADOS.completado;
            const cancelado = turno.estado === "cancelado";
            return (
              <div
                key={turno.id}
                className={`card space-y-3 p-4 transition-opacity ${
                  cancelado ? "opacity-60" : ""
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
                        {turno.profesionales?.usuarios.nombre || "Profesional"}{" "}
                        · {turno.profesionales?.especialidad || "Especialidad"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`${estado.clase} flex-shrink-0 ${
                      cancelado ? "line-through" : ""
                    }`}
                  >
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
                    ${(turno.servicios?.precio || 0).toLocaleString("es-CO")}{" "}
                    COP
                  </span>
                </div>

                {!cancelado && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => solicitarCancelacion(turno)}
                      disabled={cancelando === turno.id}
                      className="btn btn-ghost gap-1.5 text-red-600 hover:bg-red-500/10 hover:text-red-700 px-2.5 py-1.5 dark:text-red-400 dark:hover:text-red-300"
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

      {/* Modal de confirmación animado: cancelar turno */}
      <ConfirmarCancelacionModal
        turno={turnoConfirmar}
        cancelando={cancelando !== null}
        error={error}
        onClose={() => setTurnoConfirmar(null)}
        onConfirmar={confirmarCancelacion}
      />
    </div>
  );
}
