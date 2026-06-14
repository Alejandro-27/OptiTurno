import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, 
  MessageSquare, Edit2, CalendarX, Check, Send, CheckCircle2,
  Lock, Search, Info, HelpCircle, Clock, DollarSign
} from 'lucide-react';
import { initialBookings } from '../data';
import { BookingEvent } from '../types';

export default function AdminCalendar() {
  const [bookings, setBookings] = useState<BookingEvent[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const columns = [
    { id: 'carlos', name: 'Sillón 1', staff: 'Carlos Gomez' },
    { id: 'elena', name: 'Sillón 2', staff: 'Elena Ruiz' },
    { id: 'marco', name: 'Sillón 3', staff: 'Marco Silva' },
    { id: 'sofia', name: 'Manicura', staff: 'Sofía Luna' },
    { id: 'ana', name: 'Pedicura', staff: 'Ana Belén' }
  ];

  const handleAction = (type: string) => {
    if (!selectedBooking) return;
    if (type === 'send_whatsapp') {
      setShowToast(`¡Recordatorio enviado a ${selectedBooking.clientName} exitosamente vía Evolution API! 🚀`);
      setTimeout(() => setShowToast(null), 4000);
    } else if (type === 'cancel') {
      setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
      setShowToast(`Cita de ${selectedBooking.clientName} cancelada exitosamente.`);
      setTimeout(() => setShowToast(null), 3000);
    } else if (type === 'modify') {
      setShowToast(`Redireccionando al editor de citas para modificar el turno de ${selectedBooking.clientName}.`);
      setTimeout(() => setShowToast(null), 3000);
    }
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 h-full flex flex-col relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs font-bold text-slate-100">{showToast}</p>
        </div>
      )}

      {/* Header controls for Calendar */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800 rounded-xl flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-950 p-1 rounded-full border border-slate-800">
            <button className="px-4 py-1 text-xs font-bold bg-indigo-600 text-white rounded-full shadow">Diario</button>
            <button className="px-4 py-1 text-xs font-semibold text-slate-400 rounded-full hover:text-slate-200">Semanal</button>
            <button className="px-4 py-1 text-xs font-semibold text-slate-400 rounded-full hover:text-slate-200">Mensual</button>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
            <CalendarIcon size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold font-mono text-slate-350">Octubre 24, 2026</span>
          </div>
          <div className="flex gap-1">
            <button className="p-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Matrix View */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/90 shadow-2xl flex-grow overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] grid grid-cols-[100px_repeat(5,1fr)]">
          
          {/* Header Row */}
          <div className="bg-[#0b1120] h-14 border-b border-r border-slate-800/50 sticky top-0 z-30 flex items-center justify-center">
            <Clock size={16} className="text-slate-500" />
          </div>
          {columns.map(col => (
            <div key={col.id} className="bg-[#0b1120] h-14 border-b border-r border-slate-800/50 sticky top-0 z-30 flex flex-col items-center justify-center p-2 text-center text-slate-200 transition-all hover:bg-slate-900/60">
              <span className="text-xs font-bold text-indigo-400 tracking-wider">{col.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{col.staff}</span>
            </div>
          ))}

          {/* Time row entries */}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              
              {/* Hour box */}
              <div className="h-24 border-b border-r border-slate-800/50 bg-[#060814] flex items-start justify-end pr-3 pt-2 text-[10px] font-bold text-slate-500 font-mono">
                {hour}
              </div>

              {/* Slots columns map */}
              {columns.map(col => {
                const match = bookings.find(b => b.timeStart === hour && b.columnId === col.id);
                return (
                  <div 
                    key={`${hour}-${col.id}`} 
                    className="h-24 border-b border-r border-slate-800/20 bg-slate-950/30 p-2 relative group hover:bg-slate-900/10 transition-colors"
                  >
                    {match ? (
                      <div 
                        onClick={() => setSelectedBooking(match)}
                        className={`absolute inset-x-2 top-2 h-[80px] z-10 rounded-xl p-3 border-l-4 text-left transition-all hover:scale-[1.03] cursor-pointer shadow-lg active:scale-100 ${
                          match.color === 'primary' 
                            ? 'bg-indigo-600/15 border-indigo-500 hover:bg-indigo-600/25 shadow-indigo-600/5' 
                            : match.color === 'secondary'
                            ? 'bg-emerald-500/15 border-emerald-500 hover:bg-emerald-500/25 shadow-emerald-500/5'
                            : 'bg-amber-500/15 border-amber-500 hover:bg-amber-500/25 shadow-amber-500/5'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className={
                            match.color === 'primary' ? 'text-indigo-400' : match.color === 'secondary' ? 'text-emerald-400' : 'text-amber-500'
                          }>
                            {match.serviceName}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-1 truncate">{match.clientName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{match.timeStart} - {match.timeEnd}</p>
                        
                        {/* WhatsApp reminder trigger button inside event */}
                        <div className="absolute right-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            <Send size={8} />
                            Reminder
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-[9px] text-indigo-500/40 uppercase font-bold tracking-widest font-mono">Disponibles</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

        </div>
      </div>

      {/* Bottom stats layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-left bg-opacity-40 select-none">
        
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Check size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Turnos diarios</p>
            <p className="text-lg font-bold text-slate-100 font-sans">32 / 45</p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ingresos proyectados</p>
            <p className="text-lg font-bold text-slate-100 font-sans">$1,450.00</p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-550">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sin confirmar</p>
            <p className="text-lg font-bold text-slate-100 font-sans">04</p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            <CalendarX size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Cancelaciones</p>
            <p className="text-lg font-bold text-slate-100 font-sans">02</p>
          </div>
        </div>

      </div>

      {/* Booking Context Management Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-900 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-indigo-400">Gestionar Cita</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedBooking.clientName} • Service Details</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="p-1 px-2 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleAction('modify')}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-indigo-600/10 hover:text-indigo-400 text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Edit2 size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs">Modificar Cita</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">Cambiar horario, servicio o profesional asignado.</span>
                </div>
              </button>

              <button 
                onClick={() => handleAction('cancel')}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-red-650/10 hover:text-red-400 text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500/20 transition-colors">
                  <CalendarX size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-red-400">Cancelar Turno</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">Libera este espacio inmediatamente en la agenda.</span>
                </div>
              </button>

              <button 
                onClick={() => handleAction('send_whatsapp')}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-emerald-600/10 hover:text-emerald-400 text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-emerald-400">Enviar Recordatorio Manual</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">Notificar al cliente vía SMS/Whataspp con Evolution Link.</span>
                </div>
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex gap-3 border-t border-slate-800">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  setSelectedBooking(null);
                  setShowToast('Cargando ficha del cliente...');
                  setTimeout(() => setShowToast(null), 3000);
                }}
                className="flex-1 py-2 px-4 bg-indigo-650 hover:bg-indigo-600 bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Ver Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
