import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Clock,
  UserCheck,
  LogOut,
  Database,
  Info,
} from "lucide-react";

// Import child screens
import AdminDashboard from "./components/AdminDashboard";
import AdminCalendar from "./components/AdminCalendar";
import AdminCatalog from "./components/AdminCatalog";
import AdminAvailability from "./components/AdminAvailability";
import AdminProfile from "./components/AdminProfile";
import ClientShell from "./components/ClientShell";
import AccessAuth from "./components/AccessAuth";
import ThemeToggle from "./components/ThemeToggle"; // <-- IMPORTANTE: Componente importado
import { iniciarApp, logout, useStore, getEstado } from "./store";
import { MODO_DEMO } from "./config/env";

export default function App() {
  // Vista activa según el rol de la sesión (cliente -> PWA, resto -> panel)
  const [vista, setVista] = useState<"admin" | "cliente">("admin");

  // Tab within the Admin view
  const [adminTab, setAdminTab] = useState<string>("dashboard");

  // Login state proveniente del store global (sesión real o simulada)
  const sesion = useStore((s) => s.sesion);
  const errorDatos = useStore((s) => s.error);
  const esCliente = sesion?.usuario.rol === "cliente";

  // Carga inicial: repositorios (mock o API) + comunicación hacia el PWA
  useEffect(() => {
    iniciarApp().then(() => {
      // Si hay una sesión persistida de cliente, restauramos su vista PWA
      const sesionRestaurada = getEstado().sesion;
      if (sesionRestaurada?.usuario.rol === "cliente") {
        setVista("cliente");
      }
    });
    (window as any).abrirVistaCliente = () => {
      setVista("cliente");
    };
    return () => {
      delete (window as any).abrirVistaCliente;
    };
  }, []);

  // Centraliza la redirección post-autenticación según el rol de la cuenta
  const manejarAutenticado = (sesion: {
    usuario: { rol: string };
  }) => {
    if (sesion.usuario.rol === "cliente") {
      setVista("cliente");
    } else {
      setVista("admin");
    }
    setAdminTab("dashboard");
  };

  // Pantalla única de entrada: registro con elección Cliente | Comerciante
  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <header className="bg-white dark:bg-[#070b19] border-b border-slate-200 dark:border-indigo-500/10 px-6 py-4 flex justify-between items-center gap-4 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-600/25">
            OT
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                OptiTurno
              </h1>
              <span className="text-[9px] uppercase font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-none font-medium">
              {MODO_DEMO ? "Modo demostración" : "Conectado al backend real"}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md animate-scale-up">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-600/25 mx-auto">
              OT
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              Únete a OptiTurno
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Regístrate como Cliente o Comerciante y te llevaremos a tu panel
              correspondiente.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <AccessAuth
              modoInicial="registro"
              onAutenticado={manejarAutenticado}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // SIN SESIÓN: único formulario de registro/login unificado
  if (!sesion) {
    return renderLanding();
  }

  // SESIÓN DE CLIENTE (o vista cliente solicitada): app PWA con shell responsive
  if (esCliente || vista === "cliente") {
    return <ClientShell />;
  }

  // SESIÓN DE COMERCIO/ADMIN: panel de administración
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
      <header className="bg-white dark:bg-[#070b19] border-b border-slate-200 dark:border-indigo-500/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-600/25">
            OT
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                OptiTurno
              </h1>
              <span className="text-[9px] uppercase font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-none font-medium">
              Panel de control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`hidden lg:flex items-center gap-2 text-[9px] font-mono px-2.5 py-1 rounded-full border ${
              MODO_DEMO
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20 dark:border-amber-500/10"
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10"
            }`}
            title={MODO_DEMO ? "Usando datos de demostración locales" : "Conectado al backend real"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${MODO_DEMO ? "bg-amber-500" : "bg-emerald-500"} animate-ping`}
            ></span>
            {MODO_DEMO ? "MODO DEMO" : "API ONLINE"}
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Aviso de caída al modo demo cuando la API no responde en modo real */}
      {errorDatos && !MODO_DEMO && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 px-6 py-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Info size={13} />
          {errorDatos}
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar (Only if Admin is Logged In) */}
        <aside className="w-full md:w-[280px] bg-slate-100 dark:bg-[#070b17] border-r border-slate-200 dark:border-slate-900 flex flex-col justify-between p-6 space-y-8 flex-shrink-0 transition-colors duration-200">
          <nav className="space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest pl-3 block mb-3">
              Principal
            </span>

            <button
              onClick={() => setAdminTab("dashboard")}
              className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                adminTab === "dashboard"
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <LayoutDashboard size={16} />
              Panel General
            </button>

            <button
              onClick={() => setAdminTab("calendar")}
              className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                adminTab === "calendar"
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Calendar size={16} />
              Calendario Maestro
            </button>

            <button
              onClick={() => setAdminTab("catalog")}
              className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                adminTab === "catalog"
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <BookOpen size={16} />
              Catálogo de Servicios
            </button>

            <button
              onClick={() => setAdminTab("availability")}
              className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                adminTab === "availability"
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 tracking-wide"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Clock size={16} />
              Disponibilidad
            </button>

            <button
              onClick={() => setAdminTab("profile")}
              className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                adminTab === "profile"
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <UserCheck size={16} />
              Registro de Comercio
            </button>
          </nav>

          <div className="border-t border-slate-200 dark:border-slate-900 pt-5 space-y-2">
            <div className="p-3.5 bg-slate-200/50 dark:bg-slate-950 rounded-xl border border-slate-300/60 dark:border-slate-900 text-left">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                Base de Datos
              </span>
              <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 mt-1">
                <Database size={12} />
                PostgreSQL: ONLINE
              </span>
            </div>

            <button
              onClick={async () => {
                await logout();
                setAdminTab("dashboard");
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Admin Content Canvas View */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-73px)] custom-scrollbar">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-2 text-left">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                {adminTab === "dashboard" && "Panel General de Control"}
                {adminTab === "calendar" && "Calendario Maestro"}
                {adminTab === "catalog" && "Configuración de Catálogo"}
                {adminTab === "availability" && "Semanas Horarias Laborales"}
                {adminTab === "profile" && "Perfil Onboarding del Comercio"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gestión de recursos y automatizaciones de OptiTurno
              </p>
            </div>
          </div>

          {adminTab === "dashboard" && (
            <AdminDashboard onNavigate={(tab) => setAdminTab(tab)} />
          )}
          {adminTab === "calendar" && <AdminCalendar />}
          {adminTab === "catalog" && <AdminCatalog />}
          {adminTab === "availability" && <AdminAvailability />}
          {adminTab === "profile" && <AdminProfile />}
        </main>
      </div>
    </div>
  );
}