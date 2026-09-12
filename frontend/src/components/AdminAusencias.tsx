import React, { useState } from "react";
import {
  CalendarOff,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { crearAusencia, eliminarAusencia, useStore } from "../store";
import type { AusenciaDTO } from "../api/dto";

const formatearFecha = (fecha: string) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AdminAusencias() {
  const ausencias = useStore((s) => s.ausencias);
  const [fecha, setFecha] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [todoElDia, setTodoElDia] = useState(true);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("Ausencia personal");
  const [guardando, setGuardando] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [okText, setOkText] = useState<string | null>(null);

  const ordenadas = [...ausencias].sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorText(null);
    setOkText(null);
    if (!fecha) {
      setErrorText("Selecciona al menos la fecha de inicio.");
      return;
    }
    if (!todoElDia && (!horaInicio || !horaFin)) {
      setErrorText("Indica la hora de inicio y de fin de la franja.");
      return;
    }
    setGuardando(true);
    try {
      const creadas = await crearAusencia({
        fecha,
        fecha_hasta: fechaHasta || undefined,
        hora_inicio: todoElDia ? null : horaInicio,
        hora_fin: todoElDia ? null : horaFin,
        motivo,
      });
      setOkText(
        creadas.length > 1
          ? `Se registraron ${creadas.length} días de ausencia.`
          : "Ausencia registrada.",
      );
      setFecha("");
      setFechaHasta("");
      setHoraInicio("");
      setHoraFin("");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "No se pudo registrar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    setErrorText(null);
    setOkText(null);
    try {
      await eliminarAusencia(id);
      setOkText("Ausencia eliminada.");
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "No se pudo eliminar.",
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 mt-1">
          <CalendarOff size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Mis Ausencias y Vacaciones
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Bloqueá días puntuales, franjas horarias o períodos de vacaciones.
            Se reflejan al instante en el calendario de reservas de los
            clientes.
          </p>
        </div>
      </div>

      {errorText && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
          <AlertTriangle size={14} className="shrink-0" />
          {errorText}
        </div>
      )}
      {okText && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
          <CheckCircle2 size={14} className="shrink-0" />
          {okText}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Fecha de inicio
            </span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Fecha de fin (vacaciones)
            </span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setTodoElDia((v) => !v)}
            className={`flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              todoElDia
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-border-subtle dark:border-slate-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${todoElDia ? "bg-rose-500" : "bg-slate-400"}`}
            />
            Ausencia todo el día
          </button>

          <div className="flex items-center gap-2">
            <input
              type="time"
              disabled={todoElDia}
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-rose-500 disabled:opacity-50 transition-colors"
            />
            <span className="text-xs text-slate-400 font-bold">-</span>
            <input
              type="time"
              disabled={todoElDia}
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-rose-500 disabled:opacity-50 transition-colors"
            />
          </div>

          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
          >
            <option>Ausencia personal</option>
            <option>Vacaciones</option>
            <option>Capacitación</option>
            <option>Permiso</option>
            <option>Otro</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-5 py-2.5 font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-rose-600/15 active:scale-95 w-full md:w-auto"
        >
          {guardando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {guardando ? "Registrando..." : "Agregar Ausencia"}
        </button>
      </form>

      <div className="border-t border-border-subtle dark:border-slate-800 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
            {ordenadas.length === 0
              ? "Sin ausencias registradas"
              : `${ordenadas.length} ausencia${ordenadas.length > 1 ? "s" : ""} registrada${ordenadas.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {ordenadas.map((aus: AusenciaDTO) => (
          <div
            key={aus.id}
            className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatearFecha(aus.fecha)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {aus.hora_inicio && aus.hora_fin
                  ? `${aus.hora_inicio.slice(0, 5)} - ${aus.hora_fin.slice(0, 5)} hs · `
                  : "Todo el día · "}
                {aus.motivo}
              </p>
            </div>
            <button
              onClick={() => handleEliminar(aus.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
              aria-label={`Eliminar ausencia del ${formatearFecha(aus.fecha)}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}