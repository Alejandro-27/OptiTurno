import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, AlertCircle, UserPlus, TrendingUp, Sparkles, 
  Clock, CheckCircle, AlertTriangle, Mail, ArrowRight, UserCheck
} from 'lucide-react';
import { initialActivityLogs } from '../data';
import { ActivityLog } from '../types';

export default function AdminDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [animateHeartbeat, setAnimateHeartbeat] = useState<boolean>(false);

  // Auto log emitter ticker simulation (every 12 seconds adding a new randomized activity stream)
  useEffect(() => {
    const names = ['Andrés M.', 'Camila R.', 'Sofía V.', 'Santiago G.', 'Mariana L.'];
    const services = ['Corte de Autor + Lavado', 'Coloración y Mechas', 'Limpieza Facial Detox', 'Perfilado de Barba'];
    const actions = [
      { title: 'Nueva Cita', detail: ' agendó corte.', icon: 'clock' },
      { title: 'Pago Procesado', detail: ' pagó $55.000 COP.', icon: 'check-circle' },
      { title: 'Contacto WhatsApp', detail: ' solicitó recordatorio.', icon: 'user-plus' }
    ];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const newLog: ActivityLog = {
        id: Math.random().toString(),
        timeSpan: 'Justo ahora',
        icon: randomAction.icon,
        iconColor: randomAction.icon === 'check-circle' ? 'text-emerald-400' : 'text-indigo-400',
        title: randomAction.title,
        detail: `${randomName} - ${randomService}`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
      // Brief heartbeat trigger for live light
      setAnimateHeartbeat(true);
      setTimeout(() => setAnimateHeartbeat(false), 2000);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Ingresos mensuales */}
        <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ingresos mensuales</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-emerald-400 font-sans">$14.2M</span>
            <span className="block text-emerald-400 text-xs font-medium mt-1">+12,5% respecto al mes pasado</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-3/4 transition-all duration-1000"></div>
          </div>
        </div>

        {/* KPI 2: Reservas activas */}
        <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Reservas activas</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-indigo-300 font-sans">842</span>
            <span className="block text-slate-450 text-xs mt-1">48 citas hoy</span>
          </div>
          <div className="flex -space-x-2 mt-4 items-center">
            <span className="w-6 h-6 rounded-full border border-slate-800 bg-slate-700 flex items-center justify-center text-[9px] font-bold">AK</span>
            <span className="w-6 h-6 rounded-full border border-slate-800 bg-indigo-900 flex items-center justify-center text-[9px] font-bold">MR</span>
            <span className="w-6 h-6 rounded-full border border-slate-800 bg-emerald-950 flex items-center justify-center text-[9px] font-bold">SB</span>
            <span className="text-[10px] text-slate-400 pl-2 font-medium">+45 más</span>
          </div>
        </div>

        {/* KPI 3: Tasa de inasistencia */}
        <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tasa de inasistencia</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-amber-500 font-sans">18.4%</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-500 text-xs font-semibold">Alerta: por encima del objetivo</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 italic leading-tight">Recomendación: Enviar recordatorios por SMS 2 horas antes.</p>
        </div>

        {/* KPI 4: Nuevos clientes */}
        <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nuevos clientes</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <UserPlus size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100 font-sans">124</span>
            <span className="block text-emerald-400 text-xs font-semibold mt-1">+8% WoW</span>
          </div>
          <div className="mt-3 flex items-end gap-[3px] h-8">
            <div className="w-2.5 bg-indigo-500/20 h-3 rounded-sm"></div>
            <div className="w-2.5 bg-indigo-500/40 h-5 rounded-sm"></div>
            <div className="w-2.5 bg-indigo-500/60 h-4 rounded-sm"></div>
            <div className="w-2.5 bg-indigo-500/80 h-7 rounded-sm"></div>
            <div className="w-2.5 bg-indigo-500 h-8 rounded-sm"></div>
            <div className="w-2.5 bg-emerald-400 h-6 rounded-sm"></div>
          </div>
        </div>

      </div>

      {/* Main Charts & Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Picos semanales: Gráfico de demandas de alta fidelidad */}
        <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Picos semanales</h3>
              <p className="text-xs text-slate-400 mt-0.5">Intensidad de demanda por franja horaria</p>
            </div>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg">
              <span className="px-3 py-1 bg-indigo-600/15 text-indigo-400 font-bold text-[10px] rounded cursor-pointer">7D</span>
              <span className="px-3 py-1 text-slate-400 font-bold text-[10px] rounded cursor-pointer hover:text-slate-200">30D</span>
            </div>
          </div>

          {/* SVG Vector Area Chart with glow */}
          <div className="relative w-full h-56 my-6">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="gradient-area-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient-line-accent" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line stroke="#1e293b" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
              <line stroke="#1e293b" strokeDasharray="4" x1="0" x2="800" y1="100" y2="100" />
              <line stroke="#1e293b" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
              {/* Area */}
              <path d="M0,200 L0,150 C100,120 150,180 200,80 C250,-20 300,150 400,120 C500,90 600,40 700,100 C750,130 800,50 800,50 L800,200 Z" fill="url(#gradient-area-fill)"></path>
              {/* High Contrast Neon Line */}
              <path d="M0,150 C100,120 150,180 200,80 C250,-20 300,150 400,120 C500,90 600,40 700,100 C750,130 800,50 800,50" fill="none" stroke="url(#gradient-line-accent)" strokeWidth="3"></path>
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-400 px-2 font-medium">
              <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
            </div>
          </div>

          {/* Graph metadata metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center md:text-left">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Día pico</p>
              <p className="text-base font-bold text-slate-100 mt-1">Jueves</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Carga diaria promedio</p>
              <p className="text-base font-bold text-emerald-400 mt-1">82%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tiempo de espera</p>
              <p className="text-base font-bold text-slate-100 mt-1">12 min</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Eficiencia</p>
              <p className="text-base font-bold text-indigo-400 mt-1">94.8%</p>
            </div>
          </div>
        </div>

        {/* Real-time Web Socket events stream log */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl flex flex-col justify-between shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-350 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full bg-emerald-450 ${animateHeartbeat ? 'scale-125' : ''} transition-all duration-300 animate-pulse`}></span>
              Actividad en Tiempo Real
            </h3>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20">WS: CONECTADO</span>
          </div>

          <div className="p-4 flex-grow overflow-y-auto max-h-[300px] space-y-4 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 group animate-slide-in">
                <div className="mt-0.5 p-1 bg-slate-950/80 rounded-lg text-slate-400 group-hover:text-indigo-400 transition-colors">
                  {log.icon === 'clock' && <Clock size={14} className="text-indigo-400" />}
                  {log.icon === 'check-circle' && <CheckCircle size={14} className="text-emerald-400" />}
                  {log.icon === 'check-circle-2' && <CheckCircle size={14} className="text-emerald-400" />}
                  {log.icon === 'alert-triangle' && <AlertTriangle size={14} className="text-amber-500" />}
                  {log.icon === 'user-plus' && <UserPlus size={14} className="text-indigo-400" />}
                  {log.icon === 'mail' && <Mail size={14} className="text-gray-400" />}
                </div>
                <div className="flex-1 border-l border-slate-800/85 pl-3">
                  <p className="text-[10px] text-slate-400 font-medium">{log.timeSpan}</p>
                  <p className="text-xs font-semibold text-slate-100 mt-0.5">{log.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900 text-center border-t border-slate-800/50">
            <button 
              onClick={() => onNavigate('calendar')} 
              className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              Ver Historial Completo
              <ArrowRight size={10} />
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Bento: Render services statistics and predictive prompt ad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rendimiento por Categoría */}
        <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-xl md:col-span-2 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-bold text-slate-100">Rendimiento por Categoría de Agendamiento</h4>
            <span className="text-xs bg-indigo-500/10 text-indigo-450 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Métricas</span>
          </div>
          
          <div className="space-y-4">
            {/* Class 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Peluquería & Estética</span>
                <span>65%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Class 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Tratamientos Faciales</span>
                <span>22%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" style={{ width: '22%' }}></div>
              </div>
            </div>

            {/* Class 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Venta de Productos</span>
                <span>13%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ width: '13%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive AI Banner */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl min-h-[160px] flex flex-col justify-end p-6 group cursor-pointer hover:border-indigo-500 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
          
          {/* Atmospheric background neon colors */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          
          <div className="relative z-20">
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 text-[9px] font-bold rounded-full mb-2.5 inline-block uppercase tracking-wider shadow">Característica profesional</span>
            <h5 className="text-base font-bold text-indigo-300 flex items-center gap-1.5 leading-snug">
              Inteligencia Predictiva
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            </h5>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Habilita sugerencias de turnos basadas en análisis climático, eventos locales y tendencias de no-show.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
