import React, { useState } from 'react';
import { 
  Sparkles, Plus, Search, Edit3, Trash2, Check, X, ShieldAlert,
  Coins, Hourglass, Tag, ToggleLeft, ToggleRight, ListFilter
} from 'lucide-react';
import { initialServices } from '../data';
import { Service } from '../types';

export default function AdminCatalog() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'activo' | 'pausado'>('all');
  
  // Right Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Estética Masculina');
  const [formPrice, setFormPrice] = useState<number>(35000);
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formStatus, setFormStatus] = useState<'Activo' | 'Pausado'>('Activo');

  // Handle delete
  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Open drawer for adding service
  const openAddDrawer = () => {
    setEditingService(null);
    setFormName('');
    setFormCategory('Estética Masculina');
    setFormPrice(35000);
    setFormDuration(30);
    setFormStatus('Activo');
    setIsDrawerOpen(true);
  };

  // Open drawer for editing existing service
  const openEditDrawer = (svc: Service) => {
    setEditingService(svc);
    setFormName(svc.name);
    setFormCategory(svc.category);
    setFormPrice(svc.price);
    setFormDuration(svc.duration);
    setFormStatus(svc.status);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (svc: Service) => {
    setServices(prev => prev.map(s => {
      if (s.id === svc.id) {
        return { ...s, status: s.status === 'Activo' ? 'Pausado' : 'Activo' };
      }
      return s;
    }));
  };

  // Submit Drawer Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingService) {
      // Modify
      setServices(prev => prev.map(s => {
        if (s.id === editingService.id) {
          return {
            ...s,
            name: formName,
            category: formCategory,
            price: Number(formPrice),
            duration: Number(formDuration),
            status: formStatus
          };
        }
        return s;
      }));
    } else {
      // Create new
      const newItem: Service = {
        id: Math.random().toString(),
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        duration: Number(formDuration),
        status: formStatus,
        icon: 'scissors'
      };
      setServices(prev => [...prev, newItem]);
    }
    setIsDrawerOpen(false);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'activo') return matchesSearch && s.status === 'Activo';
    if (activeFilter === 'pausado') return matchesSearch && s.status === 'Pausado';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 flex h-full overflow-hidden relative">
      
      {/* List Container */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Search and Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl bg-opacity-40">
          
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por servicio o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${activeFilter === 'all' ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveFilter('activo')}
                className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${activeFilter === 'activo' ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Activos
              </button>
              <button 
                onClick={() => setActiveFilter('pausado')}
                className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${activeFilter === 'pausado' ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Pausados
              </button>
            </div>

            <button 
              onClick={openAddDrawer}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-505 bg-indigo-500 text-white rounded-lg px-4 py-2 font-semibold text-xs transition-all shadow-lg shadow-indigo-600/15 active:scale-95"
            >
              <Plus size={14} />
              Agregar Servicio
            </button>

          </div>

        </div>

        {/* Catalog Table */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800/80">
                <th className="p-4 w-1/3">Nombre del Servicio</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Duración</th>
                <th className="p-4">Precio (COP)</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 w-[120px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredServices.map(svc => (
                <tr key={svc.id} className="hover:bg-slate-800/10 group transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                        ✂️
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{svc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Standard Tier</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-350 font-medium">{svc.category}</span>
                  </td>
                  <td className="p-4 text-xs font-mono font-semibold text-slate-300">
                    {svc.duration} min
                  </td>
                  <td className="p-4 text-xs font-mono font-bold text-slate-100">
                    ${svc.price.toLocaleString('es-CO')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${svc.status === 'Activo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-rose-500'}`}></span>
                      <span className={`text-[11px] font-bold ${svc.status === 'Activo' ? 'text-emerald-450 text-emerald-400' : 'text-slate-450 text-slate-400'}`}>
                        {svc.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => handleToggleStatus(svc)}
                        title="Alternar Estado"
                        className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        {svc.status === 'Activo' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button 
                        onClick={() => openEditDrawer(svc)}
                        title="Editar"
                        className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(svc.id)}
                        title="Eliminar"
                        className="p-1 px-1.5 rounded hover:bg-red-950 text-slate-450 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                    No se encontraron servicios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Right Drawer Panel (Slides neatly when isDrawerOpen is true) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in">
          
          <div className="bg-[#0b1120] border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-slide-left p-6">
            
            <div className="space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form schema */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Servicio</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Corte de Cabello Signature"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categoría</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="Estética Masculina">Estética Masculina</option>
                    <option value="Cuidado de Piel">Cuidado de Piel</option>
                    <option value="Colorimetría">Colorimetría</option>
                    <option value="Estética Femenina">Estética Femenina</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Hourglass size={10} className="text-indigo-400" />
                      Duración (min)
                    </label>
                    <input 
                      type="number" 
                      required
                      min={5}
                      max={360}
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Coins size={10} className="text-emerald-400" />
                      Precio (COP)
                    </label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Estado Inicial</label>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormStatus('Activo')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${
                        formStatus === 'Activo' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' 
                          : 'bg-slate-950/80 text-slate-400 border-slate-850'
                      }`}
                    >
                      Activo
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormStatus('Pausado')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all border ${
                        formStatus === 'Pausado' 
                          ? 'bg-rose-500/10 text-rose-450 text-rose-400 border-rose-500' 
                          : 'bg-slate-950/80 text-slate-400 border-slate-850'
                      }`}
                    >
                      Pausado
                    </button>
                  </div>
                </div>

                <button type="submit" className="hidden" id="drawer-submit-btn"></button>

              </form>

            </div>

            <div className="bg-slate-950/60 p-4 -mx-6 -mb-6 border-t border-slate-800 flex gap-4">
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2.5 border border-slate-705 border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => {
                  const btn = document.getElementById('drawer-submit-btn');
                  if (btn) btn.click();
                }}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-600 bg-indigo-500 dialog-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/15"
              >
                Guardar
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
