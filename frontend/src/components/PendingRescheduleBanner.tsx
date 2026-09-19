import React, { useState } from "react";
import { AlertTriangle, CalendarCheck, Loader2, X } from "lucide-react";
import type { MisTurnoDTO } from "../api/dto";
import { useToast } from "../contexts/toast";
import { mensajeDeError } from "../api/dto";

const formatearFecha = (iso: string): string => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatearHora = (hora: string): string => hora.slice(0, 5);

interface Props {
  turnos: MisTurnoDTO[];
  onReagendar: (nuevaFecha: string, nuevaHora: string) => Promise<void>;
  onCerrar: (id: string) => void;
}

export default function PendingRescheduleBanner({
  turnos,
  onReagendar,
  onCerrar,
}: Props) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mostrarToast } = useToast();

  const turnoActual = turnos.find((t) => t.id === seleccionado);

  const handleConfirmar = async () => {
    if (!turnoActual || !fecha || !hora) return;
    setCargando(true);
    setError(null);
    try {
      await onReagendar(fecha, hora);
      mostrarToast("Turno reagendado correctamente.", "exito");
      setSeleccionado(null);
      setFecha("");
      setHora("");
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo reagendar."));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <AlertTriangle
          size={16}
          className="text-amber-600 dark:text-amber-400"
        />
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
          Turnos pendientes de reagendamiento
        </h3>
      </div>

      <p className="text-[11px] text-amber-700 dark:text-amber-300">
        El comercio solicitó reprogramar los siguientes turnos. Elige una nueva
        fecha y hora.
      </p>

      <div className="space-y-2">
        {turnos.map((turno) => (
          <div
            key={turno.id}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              seleccionado === turno.id
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CalendarCheck size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {turno.servicios?.nombre || "Servicio"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatearFecha(turno.fecha)} ·{" "}
                  {formatearHora(turno.hora_inicio)}
                </p>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setSeleccionado(turno.id)}
                disabled={cargando}
                className="btn btn-ghost px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
              >
                Elegir
              </button>
              <button
                onClick={() => onCerrar(turno.id)}
                disabled={cargando}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Descartar"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {seleccionado && turnoActual && (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 animate-fade-in">
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200">
            Nueva fecha para {turnoActual.servicios?.nombre}
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label-overline mb-1 block">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input w-full"
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex-1">
              <label className="label-overline mb-1 block">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setSeleccionado(null)}
              disabled={cargando}
              className="btn btn-secondary flex-1 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={cargando || !fecha || !hora}
              className="btn btn-primary flex-1 py-2"
            >
              {cargando && <Loader2 size={12} className="animate-spin" />}
              {cargando ? "Reagendando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
