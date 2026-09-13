import React, { useState } from "react";
import {
  Menu,
  X,
  CalendarPlus,
  History,
  UserCircle2,
  LogOut,
  Scissors,
} from "lucide-react";
import { logout, useStore } from "../store";
import ClientPwa from "./ClientPwa";
import MisTurnosView from "./MisTurnosView";
import MiPerfilView from "./MiPerfilView";
import AccessAuth from "./AccessAuth";
import ThemeToggle from "./ThemeToggle";

type SeccionCliente = "reservar" | "turnos" | "perfil";

const NAV_ITEMS: Array<{
  id: SeccionCliente;
  etiqueta: string;
  descripcion: string;
  icono: React.ReactNode;
}> = [
  {
    id: "reservar",
    etiqueta: "Reservar Cita",
    descripcion: "Agenda un turno en segundos",
    icono: <CalendarPlus size={18} />,
  },
  {
    id: "turnos",
    etiqueta: "Mis Turnos",
    descripcion: "Consulta y cancela reservas",
    icono: <History size={18} />,
  },
  {
    id: "perfil",
    etiqueta: "Mi Perfil",
    descripcion: "Datos personales de tu cuenta",
    icono: <UserCircle2 size={18} />,
  },
];

const TITULOS: Record<SeccionCliente, string> = {
  reservar: "Reservar una Cita",
  turnos: "Mis Turnos",
  perfil: "Mi Perfil",
};

const SUBTITULOS: Record<SeccionCliente, string> = {
  reservar: "Explora los servicios disponibles y agenda tu horario preferido.",
  turnos: "Historial de tus reservas y cancelaciones.",
  perfil: "Actualiza tus datos de contacto para recibir tus recordatorios.",
};

export default function ClientShell() {
  const sesion = useStore((s) => s.sesion);
  const [seccion, setSeccion] = useState<SeccionCliente>("reservar");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Puerta de acceso: sin sesión de cliente se muestra el formulario unificado
  if (!sesion || sesion.usuario.rol !== "cliente") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-up">
          <AccessAuth
            tipoInicial="cliente"
            modoInicial="registro"
            onAutenticado={() => {
              setSeccion("reservar");
            }}
          />
        </div>
      </div>
    );
  }

  const cerrarSesion = async () => {
    await logout();
    setMenuAbierto(false);
  };

  const irA = (id: SeccionCliente) => {
    setSeccion(id);
    setMenuAbierto(false);
  };

  const menu = (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border-subtle">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-600/25">
          OT
        </div>
        <span className="text-sm font-display font-semibold text-slate-900 dark:text-slate-50">
          OptiTurno
        </span>
        <span className="ml-auto border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 rounded border text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
          Cliente
        </span>
      </div>

      <span className="label-overline block pl-5 mt-5 mb-2">
        Menú Principal
      </span>
      <div className="space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => irA(item.id)}
            aria-current={seccion === item.id ? "page" : undefined}
            className={`flex items-start gap-3 w-full px-4 py-3 rounded-xl text-left transition-all ${
              seccion === item.id
                ? "bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
            }`}
          >
            <span className="mt-0.5">{item.icono}</span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider">
                {item.etiqueta}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                {item.descripcion}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 space-y-3 border-t border-border-subtle">
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          <span className="label-overline">Tema</span>
        </div>
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <UserCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {sesion.usuario.nombre}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {sesion.usuario.email}
            </p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex md:w-[280px] flex-shrink-0 bg-surface dark:bg-surface border-r border-border-subtle flex-col p-0 shadow-sm">
        {menu}
      </aside>

      {/* Drawer móvil (menú hamburguesa) */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-surface dark:bg-surface shadow-2xl animate-slide-in">
            <button
              onClick={() => setMenuAbierto(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            {menu}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar móvil */}
        <header className="md:hidden sticky top-0 z-40 bg-surface dark:bg-surface border-b border-border-subtle px-4 py-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Scissors size={14} className="text-indigo-500" />
            <span className="text-xs font-display font-semibold text-slate-900 dark:text-slate-50">
              OptiTurno
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="mb-5 space-y-1">
              <h2 className="text-lg md:text-xl font-display font-semibold text-slate-900 dark:text-slate-50">
                {TITULOS[seccion]}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {SUBTITULOS[seccion]}
              </p>
            </div>

            {seccion === "reservar" && <ClientPwa />}
            {seccion === "turnos" && <MisTurnosView />}
            {seccion === "perfil" && <MiPerfilView />}
          </div>
        </main>
      </div>
    </div>
  );
}
