import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Miga {
  etiqueta: string;
  to?: string;
}

const MIGAS_POR_RUTA: Record<string, Miga[]> = {
  "/reservar": [{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Reservar Cita" }],
  "/turnos": [{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Mis Turnos" }],
  "/perfil": [{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Mi Perfil" }],
  "/confirmacion": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Reservar Cita", to: "/reservar" },
    { etiqueta: "Confirmación" },
  ],
  "/admin": [{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Panel de Control" }],
  "/admin/calendario": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Calendario Maestro" },
  ],
  "/admin/catalogo": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Catálogo de Servicios" },
  ],
  "/admin/equipo": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Equipo" },
  ],
  "/admin/usuarios": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Gestión de Usuarios" },
  ],
  "/admin/disponibilidad": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Disponibilidad" },
  ],
  "/admin/perfil": [
    { etiqueta: "Inicio", to: "/" },
    { etiqueta: "Panel", to: "/admin" },
    { etiqueta: "Perfil del Comercio" },
  ],
};

/** Miga de pan: "Inicio > Sección > Subsección" (design.md §2.2). */
export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const migas = MIGAS_POR_RUTA[pathname];

  if (!migas || migas.length <= 1) return null;

  return (
    <nav aria-label="Ruta de navegación" className="text-[10px] font-semibold">
      <ol className="flex flex-wrap items-center gap-1 text-slate-500 dark:text-slate-400">
        {migas.map((miga, index) => {
          const esUltima = index === migas.length - 1;
          return (
            <li
              key={`${miga.etiqueta}-${index}`}
              className="flex items-center gap-1"
            >
              {miga.to && !esUltima ? (
                <Link
                  to={miga.to}
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {miga.etiqueta}
                </Link>
              ) : (
                <span
                  aria-current={esUltima ? "page" : undefined}
                  className={
                    esUltima
                      ? "text-slate-900 dark:text-slate-100"
                      : "transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                  }
                >
                  {miga.etiqueta}
                </span>
              )}
              {!esUltima && (
                <ChevronRight
                  size={11}
                  className="text-slate-400"
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
