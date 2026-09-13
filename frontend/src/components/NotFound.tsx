import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

/** Página 404 (ruta wildcard) — wayfinding claro y CTA de salida (skill a11y). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25">
            OT
          </div>
          <h1 className="font-display text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50">
            OptiTurno
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="animate-scale-up mx-auto max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 shadow-lg shadow-indigo-600/10 dark:text-indigo-400">
            <Compass size={30} />
          </div>
          <p className="label-overline mb-2 block">Error 404</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Esta página no existe
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            La ruta no coincide con ninguna sección de OptiTurno. Puede que el
            enlace esté desactualizado o haya sido movido.
          </p>
          <Link to="/" className="btn btn-primary mt-6 px-5 py-2.5">
            <Home size={14} />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
