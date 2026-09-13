import React from "react";
import { Clock } from "lucide-react";
import type { Service } from "../../types";

interface Props {
  svc: Service;
  onSelect: (svc: Service) => void;
}

/** Card de servicio del catálogo de reserva (design.md §6.2). */
export default function ServiceCard({ svc, onSelect }: Props) {
  return (
    <div className="card flex items-center justify-between p-3.5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="space-y-1 flex-1 pr-3 text-left">
        <span className="inline-block rounded border border-indigo-500/10 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {svc.category}
        </span>
        <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-slate-50">
          {svc.name}
        </h4>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-0.5">
            <Clock size={10} /> {svc.duration} min
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            ${svc.price.toLocaleString("es-CO")} COP
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelect(svc)}
        className="btn btn-primary px-3 py-1.5"
      >
        Agendar
      </button>
    </div>
  );
}
