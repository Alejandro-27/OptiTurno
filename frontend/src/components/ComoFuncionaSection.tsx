import { Link } from "react-router-dom";
import { Scissors, CalendarCheck2, BellRing, ArrowRight } from "lucide-react";

const PASOS = [
  {
    numero: "01",
    icono: Scissors,
    titulo: "Elegí tu servicio",
    detalle:
      "Catálogo de servicios y profesionales del comercio, con precios y duración.",
  },
  {
    numero: "02",
    icono: CalendarCheck2,
    titulo: "Agendá día y hora",
    detalle:
      "Mirá en vivo los horarios disponibles y reservá tu franja en segundos.",
  },
  {
    numero: "03",
    icono: BellRing,
    titulo: "Recibí tu confirmación",
    detalle:
      "Ticket instantáneo, recordatorio por WhatsApp y opción de agregar a tu calendario.",
  },
];

/** Pasos de "Cómo funciona" con CTA hacia la reserva (internal link para SEO). */
export default function ComoFuncionaSection() {
  return (
    <section className="border-t border-border-subtle bg-surface px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="label-overline block">Cómo Funciona</span>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
            Reservá en tres pasos
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PASOS.map((paso) => (
            <div
              key={paso.numero}
              className="card relative space-y-3 p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                  <paso.icono size={18} />
                </div>
                <span className="font-mono text-sm font-extrabold text-slate-300 dark:text-slate-700">
                  {paso.numero}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {paso.titulo}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {paso.detalle}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/reservar" className="btn btn-primary px-6 py-3">
            Empezar ahora
            <ArrowRight size={14} />
          </Link>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            Creá tu cuenta Cliente gratis y reservá tu primer turno.
          </p>
        </div>
      </div>
    </section>
  );
}
