import React from "react";
import { Check, UserRound } from "lucide-react";
import type { Profesional } from "../../types";

interface Props {
  profesionales: Profesional[];
  cargando: boolean;
  seleccionado: Profesional | null;
  onSelect: (p: Profesional) => void;
}

/** Selector de profesional del flujo de reserva (design.md §6.2). */
export default function ProfesionalPicker({
  profesionales,
  cargando,
  seleccionado,
  onSelect,
}: Props) {
  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>
      </div>
    );
  }

  if (profesionales.length === 0) {
    return (
      <p className="py-8 text-center text-[11px] text-slate-500 dark:text-slate-400">
        No hay profesionales disponibles para este servicio.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {profesionales.map((prof) => {
        const activo = seleccionado?.id === prof.id;
        return (
          <div
            key={prof.id}
            onClick={() => onSelect(prof)}
            role="radio"
            aria-checked={activo}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-sm transition-all dark:bg-slate-900/60 ${
              activo
                ? "border-indigo-600 bg-indigo-50/60 shadow-[0_0_0_1px_rgba(79,70,229,0.25)] dark:bg-indigo-600/10"
                : "border-border-subtle hover:border-slate-300 dark:border-slate-800/80 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <UserRound size={18} />
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">
                {prof.nombre}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {prof.especialidad}
              </p>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                activo
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-slate-300 dark:border-slate-600"
              }`}
              aria-hidden
            >
              {activo && <Check size={12} className="text-white" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}