import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  History,
  LogOut,
  Menu,
  Scissors,
  UserCircle2,
  X,
} from "lucide-react";
import { logout, useStore } from "../store";
import AccessAuth from "./AccessAuth";
import ThemeToggle from "./ThemeToggle";
import StickyMobileCTA from "./StickyMobileCTA";

const NAV_ITEMS = [
  {
    to: "/reservar",
    etiqueta: "Reservar Cita",
    descripcion: "Agenda un turno en segundos",
    icono: <CalendarPlus size={18} />,
  },
  {
    to: "/turnos",
    etiqueta: "Mis Turnos",
    descripcion: "Consulta y cancela reservas",
    icono: <History size={18} />,
  },
  {
    to: "/perfil",
    etiqueta: "Mi Perfil",
    descripcion: "Datos personales de tu cuenta",
    icono: <UserCircle2 size={18} />,
  },
];

/** Shell PWA de cliente: sidebar + drawer + Outlet + CTA móvil fijo. */
export default function ClientShell() {
  const sesion = useStore((s) => s.sesion);
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Puerta de acceso: sin sesión de cliente se muestra el formulario unificado
  if (!sesion || sesion.usuario.rol !== "cliente") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md animate-scale-up">
          <AccessAuth
            tipoInicial="cliente"
            modoInicial="registro"
            onAutenticado={(s) =>
              navigate(s.usuario.rol === "cliente" ? "/reservar" : "/admin")
            }
          />
        </div>
      </div>
    );
  }

  const cerrarSesion = async () => {
    await logout();
    setMenuAbierto(false);
    navigate("/");
  };

  const menu = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/25">
          OT
        </div>
        <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-50">
          OptiTurno
        </span>
        <span className="ml-auto rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Cliente
        </span>
      </div>

      <span className="label-overline mb-2 mt-5 block pl-5">
        Menú Principal
      </span>
      <div className="space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuAbierto(false)}
            className={({ isActive }) =>
              `flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-600 border-l-4 border-indigo-500 dark:bg-indigo-600/15 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              }`
            }
          >
            <span className="mt-0.5">{item.icono}</span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider">
                {item.etiqueta}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-500">
                {item.descripcion}
              </span>
            </span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto space-y-3 border-t border-border-subtle p-4">
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          <span className="label-overline">Tema</span>
        </div>
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <UserCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
              {sesion.usuario.nombre}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              {sesion.usuario.email}
            </p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition-all hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      <aside className="hidden flex-shrink-0 flex-col border-r border-border-subtle bg-surface p-0 shadow-sm dark:bg-surface md:flex md:w-[280px]">
        {menu}
      </aside>

      {menuAbierto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
          />
          <div className="animate-slide-in absolute inset-y-0 left-0 w-[280px] bg-surface/95 shadow-2xl backdrop-blur-xl dark:bg-surface/95">
            <button
              onClick={() => setMenuAbierto(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            {menu}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border-subtle bg-surface/80 px-4 py-3 backdrop-blur-xl dark:bg-surface/80 md:hidden">
          <button
            onClick={() => setMenuAbierto(true)}
            className="rounded-lg bg-slate-100 p-2 text-slate-700 transition-colors hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Scissors size={14} className="text-indigo-500" />
            <span className="font-display text-xs font-semibold text-slate-900 dark:text-slate-50">
              OptiTurno
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="custom-scrollbar flex-1 overflow-y-auto p-4 pb-28 md:p-8 md:pb-8">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>

      <StickyMobileCTA />
    </div>
  );
}
