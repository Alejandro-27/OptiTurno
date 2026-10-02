import { Link } from "react-router-dom";

export interface SeccionLegal {
  titulo: string;
  parrafos: string[];
}

export interface ContenidoLegal {
  slug: string;
  titulo: string;
  actualizacion: string;
  introduccion: string;
  secciones: SeccionLegal[];
}

const dato = (valor: string) => `[${valor}]`;

// Texto estándar para avisar que los datos de la empresa son placeholders.
const AVISO_PLACEHOLDER =
  "Los datos entre corchetes son provisionales: reemplázalos por los datos reales de tu empresa antes de publicar la página.";

export function LeyendaPlaceholder() {
  return (
    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
      ⚠ {AVISO_PLACEHOLDER}
    </p>
  );
}

export default function PaginaLegal({
  contenido,
}: {
  contenido: ContenidoLegal;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800 dark:bg-slate-950 dark:text-slate-100 md:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="label-overline mb-6 inline-block text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← Volver a OptiTurno
        </Link>
        <header className="mb-8 space-y-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {contenido.titulo}
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Última actualización: {contenido.actualizacion}
          </p>
          <LeyendaPlaceholder />
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {contenido.introduccion}
          </p>
        </header>

        <div className="space-y-8">
          {contenido.secciones.map((seccion) => (
            <section key={seccion.titulo} className="space-y-2">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                {seccion.titulo}
              </h2>
              {seccion.parrafos.map((parrafo, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  {parrafo}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-border-subtle pt-6">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            OptiTurno · {dato("RAZÓN SOCIAL")} · {dato("NIT")} · {dato("EMAIL")}
          </p>
        </footer>
      </div>
    </div>
  );
}
