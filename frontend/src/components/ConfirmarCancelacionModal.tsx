import React from "react";
import { AlertCircle, AlertTriangle, Loader2, X, CalendarCheck } from "lucide-react";
import type { MisTurnoDTO } from "../api/dto";

const formatearFecha = (iso: string): string => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatearHora = (hora: string): string => hora.slice(0, 5);

interface Props {
  turno: MisTurnoDTO | null;
  cancelando: boolean;
  error: string | null;
  onClose: () => void;
  onConfirmar: () => void;
}

export default function ConfirmarCancelacionModal({
  turno,
  cancelando,
  error,
  onClose,
  onConfirmar,
}: Props) {
  if (!turno) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-scale-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 animate-shake">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cancelar turno
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ¿Seguro? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={cancelando}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {turno.servicios?.nombre || "Servicio"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {turno.profesionales?.usuarios.nombre || "Profesional"}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
            <CalendarCheck size={12} className="text-red-400" />
            {formatearFecha(turno.fecha)} · {formatearHora(turno.hora_inicio)} -{" "}
            {formatearHora(turno.hora_fin)}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-white/40 dark:bg-slate-950/60 border border-red-500/30 rounded-lg px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelando}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            No, volver
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cancelando}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/15 flex items-center justify-center gap-1.5"
          >
            {cancelando && <Loader2 size={12} className="animate-spin" />}
            {cancelando ? "Cancelando..." : "Sí, cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}