import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { useToast, type TipoToast } from "../contexts/toast";

const CONFIG: Record<
  TipoToast,
  { icono: LucideIcon; claseIcono: string; borde: string }
> = {
  exito: {
    icono: CheckCircle2,
    claseIcono: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    borde: "border-emerald-500/25",
  },
  error: {
    icono: AlertCircle,
    claseIcono: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    borde: "border-rose-500/25",
  },
  alerta: {
    icono: AlertTriangle,
    claseIcono: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    borde: "border-amber-500/25",
  },
  info: {
    icono: Info,
    claseIcono: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    borde: "border-indigo-500/25",
  },
};

/** Pila de notificaciones flotantes (design.md §7). Ahí llegan todos los
 *  errores globales del interceptor y los éxitos de las vistas. */
export default function ToastContainer() {
  const { toasts, descartar } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-stretch gap-2 sm:items-end">
      {toasts.map((toast) => {
        const config = CONFIG[toast.tipo];
        const Icono = config.icono;
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`animate-slide-left pointer-events-auto flex w-full items-center gap-3 rounded-2xl border ${config.borde} bg-white/95 p-3.5 shadow-xl shadow-slate-950/10 backdrop-blur-md sm:w-[380px] dark:bg-slate-900/95 dark:shadow-black/40`}
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.claseIcono}`}
            >
              <Icono size={17} />
            </span>
            <p className="flex-1 text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-100">
              {toast.mensaje}
            </p>
            <button
              onClick={() => descartar(toast.id)}
              aria-label="Cerrar notificación"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
