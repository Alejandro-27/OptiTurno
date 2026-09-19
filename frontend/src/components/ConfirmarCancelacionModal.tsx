import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  CalendarCheck,
} from "lucide-react";
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
  motivo: string;
  onMotivoChange: (valor: string) => void;
  onClose: () => void;
  onConfirmar: () => void;
}

export default function ConfirmarCancelacionModal({
  turno,
  cancelando,
  error,
  motivo,
  onMotivoChange,
  onClose,
  onConfirmar,
}: Props) {
  if (!turno) return null;

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
        aria-labelledby="cancelar-turno-title"
        className="card w-full max-w-sm space-y-4 p-6 shadow-2xl animate-scale-up"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="animate-shake rounded-xl bg-red-500/10 p-2.5 text-red-600 dark:text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3
                id="cancelar-turno-title"
                className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
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
            {turno.profesionales?.usuarios.nombre || "Profesional"}
          </p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <CalendarCheck size={12} className="text-red-400" />
            {formatearFecha(turno.fecha)} · {formatearHora(turno.hora_inicio)} -{" "}
            {formatearHora(turno.hora_fin)}
          </p>
        </div>

        <div>
          <label className="label-overline mb-1 block">Motivo (opcional)</label>
          <textarea
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            placeholder="Ejemplo: Cambio de planes..."
            rows={2}
            className="input w-full resize-none text-[11px]"
            disabled={cancelando}
          />
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
            disabled={cancelando}
            className="btn btn-secondary flex-1 py-2.5"
          >
            No, volver
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cancelando}
            className="btn btn-danger flex-1 py-2.5"
          >
            {cancelando && <Loader2 size={12} className="animate-spin" />}
            {cancelando ? "Cancelando..." : "Sí, cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}
