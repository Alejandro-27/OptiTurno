import React, { useState } from "react";
import {
  Building2,
  Scissors,
  CalendarCheck,
  Check,
  Send,
  Phone,
  User,
  Hourglass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Share2,
  MapPin,
  Clock,
  Star,
  Landmark,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { initialServices } from "../data";
import { Service } from "../types";
import { reservarTurno, logout, useStore } from "../store";

const SACAR_HORA_24H = (hora12: string): string => {
  const [hora, minutos] = hora12.replace(/\s*(AM|PM)/i, "").split(":").map(Number);
  const esPM = /PM/i.test(hora12);
  const hora24 = esPM ? (hora % 12) + 12 : hora % 12;
  return `${String(hora24).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
};

const MESES: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

const fechaAISO = (etiqueta: string): string => {
  const partes = etiqueta.split(", ")[1]?.split(" ") || [];
  if (partes.length < 2) return new Date().toISOString().slice(0, 10);
  const mes = MESES[partes[0].slice(0, 3).toLowerCase()];
  const dia = Number(partes[1]);
  return new Date(2026, mes, dia).toISOString().slice(0, 10);
};

export default function ClientPwa() {
  const servicios = useStore((s) => s.servicios);
  const sesion = useStore((s) => s.sesion);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: catalog, 2: select slot, 3: contact details, 4: success

  // States of chosen parameters
  const [selectedService, setSelectedService] = useState<Service>(
    servicios[0] || initialServices[0],
  );
  const [selectedDate, setSelectedDate] = useState<string>("Jueves, Oct 24");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [clientName, setClientName] = useState("Juan Sebastián");
  const [clientWhatsapp, setClientWhatsapp] = useState("+57 322 841 9051");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available slots for selected day
  const availableHours = [
    "09:00 AM",
    "10:30 AM",
    "11:15 AM",
    "02:00 PM",
    "03:30 PM",
    "04:15 PM",
  ];
  const occupiedHours = ["10:00 AM", "12:00 PM", "01:00 PM", "05:00 PM"];

  const dates = [
    { day: "Lun", num: "21", fullday: "Lunes, Oct 21" },
    { day: "Mar", num: "22", fullday: "Martes, Oct 22" },
    { day: "Mié", num: "23", fullday: "Miércoles, Oct 23" },
    { day: "Jue", num: "24", fullday: "Jueves, Oct 24" },
    { day: "Vie", num: "25", fullday: "Viernes, Oct 25" },
    { day: "Sáb", num: "26", fullday: "Sábado, Oct 26" },
  ];

  const handleBookingConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHour) {
      alert("Por favor selecciona una hora disponible.");
      return;
    }
    setIsSubmitting(true);
    try {
      const clienteId = sesion?.usuario.id;
      await reservarTurno({
        cliente_id: clienteId || "cli-demo",
        profesional_id: "elena",
        servicio_id: selectedService.id,
        fecha: fechaAISO(selectedDate),
        hora_inicio: SACAR_HORA_24H(selectedHour),
        cliente_nombre: clientName.trim(),
        servicio_nombre: selectedService.name,
      });
      setStep(4);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "No se pudo confirmar la cita.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedHour("");
  };

  const cerrarSesion = async () => {
    await logout();
    setStep(1);
    setSelectedHour("");
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* Physical iPhone 15 Pro Wrapper Container */}
      <div className="relative w-full max-w-[365px] h-[720px] bg-slate-100 dark:bg-slate-900 rounded-[48px] border-[8px] border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col ring-8 ring-slate-200 dark:ring-slate-950 transition-colors duration-200">
        {/* Dynamic Island Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center p-1">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/40 border border-slate-800 flex-shrink-0"></div>
          <div className="flex-1"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 mr-2 animate-pulse"></span>
        </div>

        {/* Browser Top Bar Status indicators */}
        <div className="bg-slate-200 dark:bg-slate-950 text-[10px] text-slate-700 dark:text-slate-300 px-6 pt-9 pb-2 flex justify-between font-bold select-none h-14 items-center transition-colors">
          <span className="font-sans">09:41</span>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
            <span>● 5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Simulated PWA Client-View Screen */}
        <div className="flex-grow flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar relative select-none transition-colors">
          {/* Header Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center sticky top-0 z-40 transition-colors">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="m-0 text-sm font-bold text-slate-900 dark:text-slate-50">
                  💈 OptiTurno Pro Studio
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {sesion && (
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1 max-w-[90px] truncate">
                  <UserCircle2 size={10} className="text-indigo-500 flex-shrink-0" />
                  {sesion.usuario.nombre}
                </span>
              )}
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                PWA Cliente
              </span>
              {sesion && (
                <button
                  onClick={cerrarSesion}
                  title="Cerrar sesión"
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          </div>

          {/* STEP 1: SERVICES CATALOG */}
          {step === 1 && (
            <div className="p-4 space-y-6 flex-grow flex flex-col select-none">
              {/* Cover Banner (Light & Dark total) */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-slate-900 dark:to-slate-950 h-28 flex flex-col justify-end p-4 border border-indigo-400/20 dark:border-slate-800 shadow-sm transition-colors">
                <div className="relative z-20 space-y-1">
                  <div className="flex gap-1 items-center">
                    <Star size={11} className="text-amber-300 fill-amber-300" />
                    <Star size={11} className="text-amber-300 fill-amber-300" />
                    <Star size={11} className="text-amber-300 fill-amber-300" />
                    <Star size={11} className="text-amber-300 fill-amber-300" />
                    <Star size={11} className="text-amber-300 fill-amber-300" />
                    <span className="text-[9px] text-white/90 font-bold pl-1">
                      5.0 (250 reseñas)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-none">
                    Cortes & Estilo Masculino
                  </h3>
                  <p className="text-[10px] text-indigo-100 dark:text-slate-300 flex items-center gap-1">
                    <MapPin size={10} /> Sede Bogotá Centro
                  </p>
                </div>
              </div>

              {/* Catalog services cards list */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Servicios Disponibles
                </span>

                <div className="space-y-3">
                  {(servicios.length > 0 ? servicios : initialServices).map(
                    (svc) => (
                      <div
                        key={svc.id}
                        className="bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex justify-between items-center shadow-sm"
                      >
                        <div className="space-y-1 text-left flex-1 pr-3">
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/10 inline-block">
                            {svc.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50 leading-snug">
                            {svc.name}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} /> {svc.duration} min
                            </span>
                            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                              ${svc.price.toLocaleString("es-CO")} COP
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedService(svc);
                            setStep(2);
                          }}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                        >
                          Agendar
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE AND HOUR SLOT */}
          {step === 2 && (
            <div className="p-4 space-y-6 flex-grow flex flex-col select-none text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {selectedService.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {selectedService.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Selecciona el día y hora para tu cita.
                </p>
              </div>

              {/* Chronological horizontal date carousel */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Fecha de Reserva
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {dates.map((d) => (
                    <div
                      key={d.num}
                      onClick={() => setSelectedDate(d.fullday)}
                      className={`flex-shrink-0 w-12 py-2 rounded-xl text-center cursor-pointer transition-all border ${
                        selectedDate === d.fullday
                          ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-[10px] font-bold">
                        {d.day}
                      </span>
                      <span className="block text-sm font-extrabold mt-0.5">
                        {d.num}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Slots bounds */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Horas Disponibles
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {availableHours.map((hr) => (
                    <div
                      key={hr}
                      onClick={() => setSelectedHour(hr)}
                      className={`py-2 text-center rounded-xl cursor-pointer text-[11px] font-bold transition-all border ${
                        selectedHour === hr
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-105"
                          : "bg-white dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/60"
                      }`}
                    >
                      {hr}
                    </div>
                  ))}

                  {/* Occupied hours show busy pattern */}
                  {occupiedHours.map((hr) => (
                    <div
                      key={hr}
                      className="py-2 text-center rounded-xl bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300/40 dark:border-slate-800/40 line-through text-[11px] font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                    >
                      {hr}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-auto">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Total:{" "}
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    ${selectedService.price.toLocaleString("es-CO")}
                  </span>
                </span>
                <button
                  onClick={() => {
                    if (!selectedHour) {
                      alert("Selecciona una hora de reserva.");
                      return;
                    }
                    setStep(3);
                  }}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-1 active:scale-95"
                >
                  Continuar
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT FORM */}
          {step === 3 && (
            <form
              onSubmit={handleBookingConfirm}
              className="p-4 space-y-6 flex-grow flex flex-col text-left select-none"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Resumen de Agenda
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Tus Datos de Contacto
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ingresa tus datos para registrar el turno y enviarte
                  recordatorio.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Servicio:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Fecha:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Hora:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {selectedHour}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <User size={13} />
                    </span>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Número WhatsApp
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Phone size={13} />
                    </span>
                    <input
                      type="text"
                      required
                      value={clientWhatsapp}
                      onChange={(e) => setClientWhatsapp(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-semibold leading-relaxed">
                  Recordatorio Automático: Te enviaremos el ticket de asignación
                  y enlace de recordatorio a tu WhatsApp.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 mt-auto active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CalendarCheck size={14} className="text-slate-950" />
                )}
                {isSubmitting ? "Confirmando..." : "Confirmar y Reservar Cita"}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION MODAL */}
          {step === 4 && (
            <div className="p-6 space-y-6 flex-grow flex flex-col justify-center text-center animate-scale-up select-none">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Check size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  ¡Cita Confirmada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  ¡Tu espacio ha sido reservado de forma segura! Te
                  notificaremos a tu número de WhatsApp registrado.
                </p>
              </div>

              {/* Confirmation card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left space-y-3.5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>

                <div>
                  <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    Resumen del Ticket
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {selectedService.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold block">
                      Día asignado:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {selectedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold block">
                      Franja:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {selectedHour}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">
                      Cliente:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {clientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">
                      WhatsApp:
                    </span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-300">
                      {clientWhatsapp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() =>
                    alert("¡Agregado a Google Calendar con éxito!")
                  }
                  className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  📅 Agregar a Google Calendar
                </button>
                <button
                  onClick={() =>
                    alert(`¡Enviando ticket digital a ${clientWhatsapp}!`)
                  }
                  className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  ✉️ Enviar Ticket por WhatsApp
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-900 border-dashed mt-auto">
                <button
                  onClick={resetFlow}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Agendar Otro Turno
                </button>
              </div>
            </div>
          )}
        </div>

        {/* iPhone physical outline home indicator bottom bar */}
        <div className="bg-slate-200 dark:bg-slate-950 h-8 pb-1 pt-1 flex items-center justify-center select-none transition-colors">
          <div className="w-32 h-1 bg-slate-400 dark:bg-slate-800 rounded-full"></div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider select-none text-center mt-3">
        🖥️ Simulador Interactivo PWA cliente (Prueba el flujo)
      </p>
    </div>
  );
}
