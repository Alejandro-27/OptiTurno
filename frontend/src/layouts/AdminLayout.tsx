import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  UserCog,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import AccessAuth from "../components/AccessAuth";
import ThemeToggle from "../components/ThemeToggle";
import Breadcrumbs from "../components/Breadcrumbs";
import { AbrirVistaClienteContext } from "../contexts/navegacion";
import { logout, useStore } from "../store";
import { MODO_PRUEBA } from "../config/env";
import { trackEvent } from "../utils/analytics";

interface ItemNav {
  to: string;
  etiqueta: string;
  icono: typeof LayoutDashboard;
  visible: (esEmpleado: boolean, esSuperadmin: boolean) => boolean;
  fin?: boolean;
}

const ITEMS: ItemNav[] = [
  {
    to: "/admin",
    etiqueta: "Panel General",
    icono: LayoutDashboard,
    visible: () => true,
    fin: true,
  },
  {
    to: "/admin/calendario",
    etiqueta: "Calendario Maestro",
    icono: Calendar,
    visible: () => true,
  },
  {
    to: "/admin/catalogo",
    etiqueta: "Catálogo de Servicios",
    icono: BookOpen,
    visible: (empleado) => !empleado,
  },
  {
    to: "/admin/equipo",
    etiqueta: "Equipo",
    icono: Users,
    visible: (empleado) => !empleado,
  },
  {
    to: "/admin/usuarios",
    etiqueta: "Usuarios",
    icono: UserCog,
    visible: (_empleado, superadmin) => superadmin,
  },
  {
    to: "/admin/disponibilidad",
    etiqueta: "Disponibilidad",
    icono: Clock,
    visible: () => true,
  },
  {
    to: "/admin/perfil",
    etiqueta: "Editar Comercio",
    icono: UserCheck,
    visible: (empleado) => !empleado,
  },
];

const TABS: Record<string, { titulo: string; subtitulo: string }> = {
  "/admin": {
    titulo: "Panel General de Control",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/calendario": {
    titulo: "Calendario Maestro",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/catalogo": {
    titulo: "Configuración de Catálogo",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/equipo": {
    titulo: "Equipo de Profesionales",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/usuarios": {
    titulo: "Gestión de Usuarios",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/disponibilidad": {
    titulo: "Semanas Horarias Laborales",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
  "/admin/perfil": {
    titulo: "Perfil Onboarding del Comercio",
    subtitulo: "Gestión de recursos y automatizaciones de OptiTurno",
  },
};

/** Shell del panel admin (sidebar + drawer móvil + breadcrumbs + Outlet). */
export default function AdminLayout() {
  const sesion = useStore((s) => s.sesion);
  const errorDatos = useStore((s) => s.error);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const esEmpleado = sesion?.usuario.rol === "empleado";
  const esSuperadmin = sesion?.usuario.rol === "superadmin";
  const encabezado = TABS[pathname] || TABS["/admin"];

  if (!sesion || sesion.usuario.rol === "cliente") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md animate-scale-up">
          <AccessAuth
            tipoInicial="comercio"
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
    setSidebarAbierto(false);
    navigate("/");
  };

  const contenidoSidebar = (
    <nav className="space-y-1.5 text-left">
      <span className="label-overline mb-3 block pl-3">Principal</span>
      {ITEMS.filter((item) => item.visible(esEmpleado, esSuperadmin)).map(
        (item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.fin}
            onClick={() => setSidebarAbierto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`
            }
          >
            <item.icono size={16} />
            {item.etiqueta}
          </NavLink>
        ),
      )}
      <div className="border-t border-border-subtle pt-5 space-y-2">
        <div className="p-3.5 bg-slate-200/50 dark:bg-slate-950 rounded-xl border border-slate-300/60 dark:border-slate-900 text-left min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
            {esEmpleado
              ? "Empleado"
              : sesion.usuario.rol === "superadmin"
                ? "Super Admin"
                : "Comercio"}
          </span>
          <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 mt-1 truncate">
            <User size={12} className="flex-shrink-0" />
            {sesion.usuario.nombre}
          </span>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  return (
    <AbrirVistaClienteContext.Provider
      value={() => {
        trackEvent("abrir_vista_cliente");
        navigate("/reservar");
      }}
    >
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 selection:bg-indigo-500/30 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border-subtle bg-surface/80 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarAbierto(true)}
              className="rounded-lg bg-slate-100 p-2 text-slate-700 transition-colors hover:text-slate-900 md:hidden dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>
            <Link to="/admin" className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25">
                OT
              </div>
              <div className="text-left min-w-0">
                <h1 className="font-display text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50">
                  OptiTurno
                </h1>
                <p className="mt-1 text-[10px] font-medium leading-none text-slate-500 dark:text-slate-400">
                  Panel de control
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9px] lg:flex ${
                MODO_PRUEBA
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  MODO_PRUEBA ? "bg-amber-500" : "bg-emerald-500"
                } animate-ping`}
              />
              {MODO_PRUEBA ? "MODO PRUEBA" : "API ONLINE"}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {errorDatos && !MODO_PRUEBA && (
          <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/5 md:px-6 dark:text-amber-400">
            <Info size={13} />
            {errorDatos}
          </div>
        )}

        <div className="flex flex-grow flex-col md:flex-row">
          <aside className="hidden w-[280px] flex-shrink-0 flex-col justify-between border-r border-border-subtle bg-surface p-6 md:flex">
            {contenidoSidebar}
          </aside>

          {sidebarAbierto && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarAbierto(false)}
              />
              <aside className="animate-slide-in absolute inset-y-0 left-0 w-[280px] max-w-[85vw] flex flex-col justify-between space-y-8 overflow-y-auto border-r border-border-subtle bg-surface/95 p-6 shadow-2xl backdrop-blur-xl custom-scrollbar">
                <button
                  onClick={() => setSidebarAbierto(false)}
                  className="absolute right-4 top-4 p-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  aria-label="Cerrar menú"
                >
                  <X size={18} />
                </button>
                {contenidoSidebar}
              </aside>
            </div>
          )}

          <main className="custom-scrollbar flex-grow overflow-y-auto p-4 max-h-[calc(100dvh-64px)] md:max-h-[calc(100vh-73px)] md:p-6 lg:p-8">
            <div className="mb-5 space-y-1 text-left">
              <Breadcrumbs />
            </div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-left">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50 md:text-2xl">
                  {encabezado.titulo}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {encabezado.subtitulo}
                </p>
              </div>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </AbrirVistaClienteContext.Provider>
  );
}
