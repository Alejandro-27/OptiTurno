import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Check,
  Save,
  ToggleLeft,
  ToggleRight,
  Info,
  AlertTriangle,
  Coffee,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { DayAvailability } from "../types";
import { guardarDisponibilidad, useStore } from "../store";

export default function AdminAvailability() {
  const schedule = useStore((s) => s.equipo);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleToggleDay = (day: string) => {
    guardarDisponibilidad(
      schedule.map((item) =>
        item.day === day ? { ...item, enabled: !item.enabled } : item,
      ),
    ).catch((err) => {
      setErrorText(
        err instanceof Error ? err.message : "No se pudo actualizar.",
      );
    });
  };

  const handleValueChange = (
    day: string,
    field: keyof DayAvailability,
    value: string,
  ) => {
    guardarDisponibilidad(
      schedule.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    ).catch((err) => {
      setErrorText(
        err instanceof Error ? err.message : "No se pudo actualizar.",
      );
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      await guardarDisponibilidad(schedule);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "No se pudo guardar.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 flex flex-col relative pb-12 transition-colors duration-200">
      {/* Toast Banner */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <div className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              ¡Configuración Sincronizada!
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              La disponibilidad fue guardada en el backend de forma segura.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorText && (
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-xl p-4 shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <div className="p-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Error al guardar
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {errorText}
            </p>
          </div>
        </div>
      )}

      {/* Header card with alert block */}
      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 mt-1">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Define Tu Disponibilidad Laboral
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Configura tus jornadas laborales y franjas de almuerzo o descanso.
              Estos límites se exportan automáticamente a tus canales de
              agendamiento y plataformas de reservas instantáneas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-600 dark:text-amber-500 animate-fade-in">
          <AlertTriangle size={16} className="shrink-0" />
          <p className="text-[11px] font-semibold leading-relaxed">
            Nota: Al pausar un día laborable, se cancelarán las sugerencias
            automáticas de bloques para ese día en el calendario de clientes.
          </p>
        </div>
      </div>

      {/* Working Matrix */}
      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
            Horarios Operacionales por Día
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Modo: Semana Estándar
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {schedule.map((slot) => (
            <div
              key={slot.day}
              className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-colors ${
                slot.enabled
                  ? "bg-transparent dark:bg-slate-950/20"
                  : "bg-slate-50/70 dark:bg-slate-950/60 opacity-60"
              }`}
            >
              {/* Day info name & status check */}
              <div className="md:col-span-3 flex items-center justify-between pointer-events-auto md:justify-start gap-3">
                <button
                  onClick={() => handleToggleDay(slot.day)}
                  className="flex items-center"
                >
                  {slot.enabled ? (
                    <ToggleRight
                      size={24}
                      className="text-emerald-500 cursor-pointer"
                    />
                  ) : (
                    <ToggleLeft
                      size={24}
                      className="text-slate-400 dark:text-slate-500 cursor-pointer"
                    />
                  )}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">
                    {slot.day}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    {slot.enabled ? "Abierto" : "No Laborable"}
                  </p>
                </div>
              </div>

              {/* Work shift bounds */}
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider w-8">
                  Turno:
                </span>
                <div className="flex items-center gap-1.5 flex-1 select-none">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Sun size={12} />
                    </span>
                    <input
                      type="text"
                      disabled={!slot.enabled}
                      value={slot.openTime}
                      onChange={(e) =>
                        handleValueChange(slot.day, "openTime", e.target.value)
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 pl-7 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    -
                  </span>
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Moon size={12} />
                    </span>
                    <input
                      type="text"
                      disabled={!slot.enabled}
                      value={slot.closeTime}
                      onChange={(e) =>
                        handleValueChange(slot.day, "closeTime", e.target.value)
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 pl-7 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Rest shift bounds */}
              <div className="md:col-span-5 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider w-12 flex items-center gap-0.5">
                  <Coffee size={10} className="text-amber-500" />
                  Almuerzo:
                </span>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    disabled={!slot.enabled}
                    value={slot.restStart}
                    onChange={(e) =>
                      handleValueChange(slot.day, "restStart", e.target.value)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-center transition-colors"
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    -
                  </span>
                  <input
                    type="text"
                    disabled={!slot.enabled}
                    value={slot.restEnd}
                    onChange={(e) =>
                      handleValueChange(slot.day, "restEnd", e.target.value)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 text-center transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control row */}
      <div className="flex justify-end p-2">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/15 active:scale-95"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Save size={14} />
          )}
          {isLoading ? "Sincronizando..." : "Guardar Configuración de Horas"}
        </button>
      </div>
    </div>
  );
}
