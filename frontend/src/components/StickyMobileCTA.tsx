import { Link, useLocation } from "react-router-dom";

interface CtaConfig {
  etiqueta: string;
  to: string;
}

// CTA contextual por ruta: solo en la PWA de cliente y solo en móvil.
// null = oculto (en /reservar el wizard ya tiene su propio CTA).
const CTA_POR_RUTA: Record<string, CtaConfig | null> = {
  "/reservar": null,
  "/turnos": { etiqueta: "Reservar cita", to: "/reservar" },
  "/perfil": { etiqueta: "Reservar cita", to: "/reservar" },
  "/confirmacion": { etiqueta: "Ver mis turnos", to: "/turnos" },
};

/** Barra fija inferior solo móvil (md:hidden) que empuja la conversión. */
export default function StickyMobileCTA() {
  const { pathname } = useLocation();
  const cta = CTA_POR_RUTA[pathname];
  if (!cta) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/60 dark:border-slate-800/60 md:hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-100/95 via-slate-100/60 to-transparent dark:from-slate-950/95 dark:via-slate-950/60 dark:to-transparent" />
      <div className="px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <Link
          to={cta.to}
          className="btn btn-primary w-full py-3 shadow-xl shadow-indigo-600/25"
        >
          {cta.etiqueta}
        </Link>
      </div>
    </div>
  );
}
