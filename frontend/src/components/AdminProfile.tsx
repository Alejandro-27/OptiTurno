import React, { useState } from 'react';
import { 
  Building2, Hash, Globe, MapPin, Phone, FileText, CheckCircle2,
  Sparkles, ShieldCheck, HeartPulse, Palette, ArrowRight, UserCheck
} from 'lucide-react';

export default function AdminProfile() {
  const [name, setName] = useState('OptiTurno Pro Studio');
  const [category, setCategory] = useState('Estética & Barberías');
  const [subdomain, setSubdomain] = useState('optiturnoprostudio');
  const [address, setAddress] = useState('Calle G #45-12, Bogotá');
  const [phone, setPhone] = useState('+57 321 456 7890');
  const [description, setDescription] = useState('SaaS vanguardista de estilismo premium, ofreciendo cortes exclusivos y tratamientos de cuidado facial de alta gama.');

  const [activeStep, setActiveStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      setActiveStep(3); // Success step
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 max-w-4xl mx-auto">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">¡Perfil Actualizado!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">El subdominio y pasarela de pago han sido activados en OptiTurno.</p>
          </div>
        </div>
      )}

      {/* Progress Wizard Header */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center max-w-xl mx-auto mb-4">
          
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              activeStep >= 1 ? 'bg-indigo-600 text-white font-sans' : 'bg-slate-850 text-slate-500'
            }`}>
              1
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-1.5">Información</span>
          </div>

          <div className="flex-1 h-[2px] bg-slate-800 mx-2 -mt-4">
            <div className={`h-full bg-indigo-505 bg-indigo-500 transition-all duration-500 ${activeStep >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              activeStep >= 2 ? 'bg-indigo-600 text-white font-sans' : 'bg-slate-850 text-slate-500'
            }`}>
              2
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-1.5">Personalización</span>
          </div>

          <div className="flex-1 h-[2px] bg-slate-800 mx-2 -mt-4">
            <div className={`h-full bg-indigo-505 bg-indigo-500 transition-all duration-500 ${activeStep >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              activeStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-500'
            }`}>
              3
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-1.5">Fin de Registro</span>
          </div>

        </div>
      </div>

      {activeStep === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setActiveStep(2); }} className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Building2 size={16} className="text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-200">Ficha Técnica del Comercio</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre de Marca</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categoría Comercial</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Estética & Barberías">Estética & Barberías</option>
                <option value="Salud & Spa">Salud & Spa</option>
                <option value="Clínicas Dentales">Clínicas Dentales</option>
                <option value="Consultorios Médicos">Consultorios Médicos</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dirección Física de la Sede</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <MapPin size={14} />
                </span>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono de Soporte (WhatsApp compatible)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Phone size={14} />
                </span>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs font-semibold font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subdominio Exclusivo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <Globe size={14} className="text-indigo-400" />
                </span>
                <input 
                  type="text" 
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-24 text-xs font-semibold font-mono text-indigo-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-500 font-bold font-mono">
                  .optiturno.com
                </span>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Descripción o Eslogan comercial</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button 
              type="submit" 
              className="group flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 bg-indigo-500 text-white rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Siguiente Paso
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      )}

      {activeStep === 2 && (
        <form onSubmit={handleSubmit} className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Palette size={16} className="text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-200">Personalización Visual del Portal Cliente</h4>
          </div>

          <div className="space-y-6">
            
            {/* Color accent picks */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Color de Enfoque</label>
              <div className="grid grid-cols-4 gap-3 max-w-md">
                <div className="border-2 border-indigo-500 bg-indigo-600/10 p-3 rounded-xl flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-bold">Indigo Neo</span>
                </div>
                <div className="border border-slate-805 border-slate-800 bg-transparent opacity-60 p-3 rounded-xl flex items-center gap-2 cursor-default">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-400">Emerald</span>
                </div>
                <div className="border border-slate-805 border-slate-800 bg-transparent opacity-60 p-3 rounded-xl flex items-center gap-2 cursor-default">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-slate-400">Amber</span>
                </div>
                <div className="border border-slate-805 border-slate-800 bg-transparent opacity-60 p-3 rounded-xl flex items-center gap-2 cursor-default">
                  <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold text-slate-400">Sunset</span>
                </div>
              </div>
            </div>

            {/* Logo placeholder selections */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Logotipo oficial (Banner)</label>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-4xl">
                  💈
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-200">Previsualización del Isotopo</span>
                  <p className="text-[10px] text-slate-400 mt-1">Sugerido: Formato PNG transparente de 512px por 512px para visualización en pantallas Retina.</p>
                </div>
              </div>
            </div>

            {/* Terms checking banner */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex gap-3">
              <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Canal SSL de Seguridad</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Todos los datos generados por sus clientes y transacciones financieras cumplen con el estándar PCI-DSS. OptiTurno no comparte información sensible con terceros.</p>
              </div>
            </div>

          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800/80">
            <button 
              type="button" 
              onClick={() => setActiveStep(1)}
              className="py-2.5 px-6 border border-slate-705 border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Atrás
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 bg-indigo-500 text-white rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/15"
            >
              {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isLoading ? 'Guardando...' : 'Completar Registro'}
            </button>
          </div>
        </form>
      )}

      {activeStep === 3 && (
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-6 animate-scale-up">
          
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <UserCheck size={32} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-50">¡Onboarding Completado Exitosamente!</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Tu software OptiTurno ya se encuentra activo en producción. El subdominio privado ahora está abierto para recibir citas de clientes.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl max-w-sm mx-auto border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Tu Enlace PWA Cliente:</span>
            <span className="text-sm font-bold text-indigo-400 font-mono mt-1.5 block">
              https://{subdomain}.optiturno.com
            </span>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-slate-800/60 max-w-md mx-auto">
            <button 
              type="button"
              onClick={() => setActiveStep(1)}
              className="flex-1 py-2 px-4 border border-slate-705 border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Editar Perfil
            </button>
            <button 
              type="button"
              onClick={() => {
                const win = window as any;
                if(win.triggerClientTab) {
                  win.triggerClientTab(); // Direct interactive loop jump to simulation!
                }
              }}
              className="flex-grow flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Ver Simulador Cliente
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
