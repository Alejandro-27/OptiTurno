import { BellRing, CalendarClock, LayoutDashboard } from "lucide-react";

const BENEFICIOS = [
  {
    icono: CalendarClock,
    titulo: "Disponibilidad en tiempo real",
    detalle:
      "Los clientes ven las franjas libres en vivo y reservan sin llamadas. La plataforma impide las dobles reservas.",
  },
  {
    icono: BellRing,
    titulo: "Recordatorios automáticos",
    detalle:
      "Avísale a cada cliente antes de su turno por WhatsApp. Menos ausencias, sin que el equipo tenga que hacer nada.",
  },
  {
    icono: LayoutDashboard,
    titulo: "Todo el negocio en un panel",
    detalle:
      "Servicios, profesionales, horarios y ausencias gestionados desde un solo lugar, pensado para el día a día del comercio.",
  },
];

/** Beneficios reales de OptiTurno para la landing (design.md §6.3). */
export default function BeneficiosSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="mb-10 text-center">
        <span className="label-overline block">Beneficios</span>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Lo que OptiTurno hace por tu comercio
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Agendamiento inteligente pensado para barberías, spas, salud y
          cualquier servicio presencial.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {BENEFICIOS.map((b) => (
          <div
            key={b.titulo}
            className="card space-y-3 p-5 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <b.icono size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {b.titulo}
            </h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {b.detalle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
