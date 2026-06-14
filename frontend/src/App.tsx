import React, { useState, useEffect } from 'react';
import { 
  Building2, Laptop, Smartphone, Code2, LayoutDashboard, Calendar, 
  BookOpen, Clock, UserCheck, HelpCircle, LogOut, ArrowRight, Shield,
  Layers, Lock, Database, Info, RefreshCw
} from 'lucide-react';

// Import child screens
import AdminDashboard from './components/AdminDashboard';
import AdminCalendar from './components/AdminCalendar';
import AdminCatalog from './components/AdminCatalog';
import AdminAvailability from './components/AdminAvailability';
import AdminProfile from './components/AdminProfile';
import AdminLogin from './components/AdminLogin';
import ClientPwa from './components/ClientPwa';
// import AngularCodeViewer from './components/AngularCodeViewer';

export default function App() {
  // Navigation tabs of application
  const [activeTab, setActiveTab] = useState<'admin' | 'pwa' | 'code'>('admin');
  
  // Tab within the Admin view
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  
  // Login simulator state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(true);

  // Hook-up communication helper so Profile can navigate to simulator!
  useEffect(() => {
    (window as any).triggerClientTab = () => {
      setActiveTab('pwa');
    };
    return () => {
      delete (window as any).triggerClientTab;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Professional Toggle Switcher Interface Bar */}
      <header className="bg-[#070b19] border-b border-indigo-500/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-600/25">
            OT
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-50 tracking-tight leading-none">OptiTurno</h1>
              <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">SaaS</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">Panel de control</p>
          </div>
        </div>

        {/* View Mode Selectors */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900/60 shadow-inner">
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'admin' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-sans' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop size={14} />
            🖥️ Vista Administrador
          </button>
          
          <button 
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'pwa' 
                ? 'bg-[#10b981] text-slate-950 shadow-lg shadow-[#10b981]/20 font-sans' 
                : 'text-slate-400 hover:text-slate-205 hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} />
            📱 Vista Cliente PWA
          </button>

          {/* <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'code' 
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            📦 Código Angular 21 + Ionic
          </button> */}
        </div>

        {/* Sync Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Logo de la empresa
        </div>

      </header>

      {/* Main Body */}
      <div className="flex-grow flex flex-col md:flex-row">
        
        {/* VIEW 1: VISTA ADMINISTRATIVO (DESKTOP) */}
        {activeTab === 'admin' && (
          <div className="flex-1 flex flex-col md:flex-row h-full">
            
            {/* Sidebar (Only if Admin is Logged In) */}
            {isAdminLoggedIn && (
              <aside className="w-full md:w-[280px] bg-[#070b17] border-r border-slate-900 flex flex-col justify-between p-6 space-y-8 flex-shrink-0">
                <nav className="space-y-1.5 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-3 block mb-3">Principal</span>
                  
                  <button 
                    onClick={() => setAdminTab('dashboard')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'dashboard' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5' 
                        : 'text-slate-450 text-slate-450 text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    Panel General
                  </button>

                  <button 
                    onClick={() => setAdminTab('calendar')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'calendar' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5' 
                        : 'text-slate-450 text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <Calendar size={16} />
                    Calendario Maestro
                  </button>

                  <button 
                    onClick={() => setAdminTab('catalog')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'catalog' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm shadow-indigo-600/5' 
                        : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <BookOpen size={16} />
                    Catálogo de Servicios
                  </button>

                  <button 
                    onClick={() => setAdminTab('availability')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'availability' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 tracking-wide' 
                        : 'text-slate-450 text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <Clock size={16} />
                    Disponibilidad
                  </button>

                  <button 
                    onClick={() => setAdminTab('profile')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'profile' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500' 
                        : 'text-slate-450 text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <UserCheck size={16} />
                    Registro de Comercio
                  </button>

                  <button 
                    onClick={() => setAdminTab('login')}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      adminTab === 'login' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500' 
                        : 'text-slate-450 text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                    }`}
                  >
                    <Lock size={16} />
                    Pantalla Acceso
                  </button>
                </nav>

                <div className="border-t border-slate-900 pt-5 space-y-2">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Base de Datos</span>
                    <span className="text-xs font-bold text-slate-205 flex items-center gap-1.5 text-indigo-300 mt-1">
                      <Database size={12} />
                      PostgreSQL: ONLINE
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setAdminTab('login');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/5 transition-all text-left"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </aside>
            )}

            {/* Admin Content Canvas View */}
            <main className="flex-grow p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-73px)] custom-scrollbar">
              
              {!isAdminLoggedIn ? (
                <div className="max-w-4xl mx-auto py-12">
                  <AdminLogin onLoginSuccess={() => {
                    setIsAdminLoggedIn(true);
                    setAdminTab('dashboard');
                  }} />
                </div>
              ) : (
                <>
                  <div className="mb-6 flex justify-between items-center flex-wrap gap-2 text-left">
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-slate-50">
                        {adminTab === 'dashboard' && 'Panel General de Control'}
                        {adminTab === 'calendar' && 'Calendario Maestro'}
                        {adminTab === 'catalog' && 'Configuración de Catálogo'}
                        {adminTab === 'availability' && 'Semanas Horarias Laborales'}
                        {adminTab === 'profile' && 'Perfil Onboarding del Comercio'}
                        {adminTab === 'login' && 'Visual de Acceso Administrativo'}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Gestión de recursos y automatizaciones de OptiTurno</p>
                    </div>
                  </div>

                  {adminTab === 'dashboard' && <AdminDashboard onNavigate={(tab) => setAdminTab(tab)} />}
                  {adminTab === 'calendar' && <AdminCalendar />}
                  {adminTab === 'catalog' && <AdminCatalog />}
                  {adminTab === 'availability' && <AdminAvailability />}
                  {adminTab === 'profile' && <AdminProfile />}
                  {adminTab === 'login' && (
                    <div className="max-w-4xl mx-auto py-4">
                      <AdminLogin onLoginSuccess={() => alert('¡Autenticado con éxito!')} />
                    </div>
                  )}
                </>
              )}

            </main>

          </div>
        )}

        {/* VIEW 2: CLIENT PWA SIMULATOR */}
        {activeTab === 'pwa' && (
          <main className="flex-1 p-6 lg:p-8 flex flex-col items-center justify-center bg-[#030612] min-h-[calc(100vh-73px)]">
            <div className="max-w-3xl text-center space-y-4 mb-4 select-none">
              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded-full text-[10px] font-bold uppercase tracking-wider">INTERACTION LIVE PREVIEW</span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">Simulador de PWA del Cliente</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Los clientes acceden mediante el código QR de su comercio a esta experiencia ultraligera PWA, pudiendo agendar en segundos. Prueba el flujo interactivo abajo completando una reserva de prueba.
              </p>
            </div>
            
            <ClientPwa />
          </main>
        )}

        {/* VIEW 3: ANGULAR + IONIC CODE VIEWER */}
        {activeTab === 'code' && (
          <main className="flex-1 p-6 lg:p-8 bg-[#03050c] min-h-[calc(100vh-73px)] overflow-y-auto">
            {/* <AngularCodeViewer /> */}
          </main>
        )}

      </div>

    </div>
  );
}
