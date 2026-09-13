import { Quote, TrendingDown, Zap, CheckCircle2 } from "lucide-react";

const TESTIMONIOS = [
  {
    nombre: "Camila Rojas",
    rol: "Dueña · Barbería Centro",
    cita: "Redujimos las inasistencias un 35% en el primer trimestre. Los recordatorios por WhatsApp hicieron la diferencia.",
    metrica: "−35%",
    metricaEtiqueta: "Ausencias",
    icono: TrendingDown,
  },
  {
    nombre: "Andrés Mejía",
    rol: "Gerente · Estética Spa",
    cita: "El 91,5% de nuestros turnos se confirman en la agenda sin llamadas. El equipo ya no pierde tiempo persiguiendo citas.",
    metrica: "91,5%",
    metricaEtiqueta: "Confirmación automática",
    icono: CheckCircle2,
  },
  {
    nombre: "Laura Vidal",
    rol: "Stilista · Salud & Spa",
    cita: "Antes vivíamos con la agenda manual. Ahora cada profesional tiene su horario y los clientes reservan solos.",
    metrica: "3×",
    metricaEtiqueta: "Más citas agendadas",
    icono: Zap,
  },
];

/** Prueba social de la landing: testimonios con métricas (design.md §6.3). */
export default function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mb-10 text-center">
        <span className="label-overline block">Casos de Éxito</span>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Comercios que dejaron de perder turnos
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Barberías, spas y consultorios que ya agendan con OptiTurno.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIOS.map((t) => (
          <figure
            key={t.nombre}
            className="card relative flex flex-col justify-between space-y-4 p-5 transition-shadow hover:shadow-md"
          >
            <div>
              <Quote
                size={18}
                className="text-indigo-600/30 dark:text-indigo-400/30"
                aria-hidden
              />
              <blockquote className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {t.cita}
              </blockquote>
            </div>

            <figcaption className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-900 dark:text-slate-50">
                  {t.nombre}
                </p>
                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {t.rol}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-400">
                <t.icono size={13} className="flex-shrink-0" />
                <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-wide">
                  {t.metrica}
                </span>
                <span className="text-[9px] font-semibold text-emerald-700/60 dark:text-emerald-400/60">
                  {t.metricaEtiqueta}
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
