import React, { useState } from 'react';
import { 
  Building2, Mail, Lock, ShieldAlert, Check, Sparkles, AlertCircle,
  Eye, EyeOff, Globe, ArrowRight, CornerDownRight
} from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('admin@optiturno.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.trim() === '' || password.trim() === '') {
        setErrorText('Por favor ingresa credenciales válidas.');
      } else {
        onLoginSuccess();
      }
    }, 1200);
  };

  return (
    <div className="min-h-[550px] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up">
      
      {/* Left panel promotional cover */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#0c102a] via-slate-900 to-[#1e1435] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-slate-100 text-sm">OT</span>
          <span className="font-bold text-lg text-slate-200 uppercase tracking-widest text-[12px]">OptiTurno Suite</span>
        </div>

        <div className="relative z-10 my-8 space-y-4">
          <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wider">B2B2C SaaS Engine</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50 leading-tight">
            Agendamiento Predictivo de Alto Impacto
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Elimine el no-show, organice turnos en segundos con nuestro algoritmo inteligente y despliegue su propia PWA para clientes.
          </p>

          <div className="space-y-2 pt-2 text-left">
            <div className="flex gap-2 items-start text-xs text-slate-350">
              <CornerDownRight size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <span>Multi-agenda por sillones/profesionales</span>
            </div>
            <div className="flex gap-2 items-start text-xs text-slate-350">
              <CornerDownRight size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Notificaciones instantáneas vía WhatsApp</span>
            </div>
            <div className="flex gap-2 items-start text-xs text-slate-350">
              <CornerDownRight size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span>Predictor de cancelaciones por clima</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          © 2026 OptiTurno Pro • All rights reserved.
        </div>
      </div>

      {/* Right panel log form */}
      <div className="md:w-1/2 bg-[#060913] p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-900/60 text-left">
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-50">Acceso Administrativo</h3>
          <p className="text-xs text-slate-450 mt-1">Ingresa tus credenciales para administrar tus turnos</p>
        </div>

        {errorText && (
          <div className="mb-4 bg-red-500/15 border border-red-500/35 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle size={14} />
            <p className="font-semibold">{errorText}</p>
          </div>
        )}

        {/* LoginForm */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Correo Registrado</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail size={14} />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="ej: admin@comercio.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contraseña</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-indigo-400 hover:underline">¿La olvidaste?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={14} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer user-select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-850 text-indigo-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
              />
              <span className="font-medium text-[11px]">Recordarme en este navegador</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 bg-indigo-505 bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Globe size={14} />
            )}
            {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>

        </form>

        <div className="pt-6 mt-6 border-t border-slate-950 flex items-center justify-between gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Demo Account Credentials:</span>
          <span>admin@optiturno.com / password123</span>
        </div>

      </div>

    </div>
  );
}
