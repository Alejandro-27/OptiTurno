import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Check,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  CreditCard,
  ShieldCheck,
  Wallet,
  UserRound,
} from "lucide-react";
import { initialServices } from "../data";
import { repositorios, turnosRepositorioMock } from "../data/index";
import { Service, Profesional } from "../types";
import {
  reservarTurno,
  confirmarPago,
  listarProfesionales,
  useStore,
} from "../store";
import type { DisponibilidadDTO } from "../api/dto";

const SACAR_HORA_24H = (hora12: string): string => {
  const [hora, minutos] = hora12.replace(/\s*(AM|PM)/i, "").split(":").map(Number);
  const esPM = /PM/i.test(hora12);
  const hora24 = esPM ? (hora % 12) + 12 : hora % 12;
  return `${String(hora24).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
};

const A_HORA12 = (hora24: string): string => {
  const [h, m] = hora24.split(":").map(Number);
  const esPM = h >= 12;
  const hora12 = ((h % 12) || 12).toString().padStart(2, "0");
  return `${hora12}:${String(m).padStart(2, "0")} ${esPM ? "PM" : "AM"}`;
};

const MESES_CORTO = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const DIAS_LARGO = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

// Genera una etiqueta legible tipo "Jueves, Oct 24" y la fecha ISO de hoy + offset
const fechaDesdeOffset = (offset: number): { etiqueta: string; iso: string } => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const iso = d.toISOString().slice(0, 10);
  const etiqueta = `${DIAS_LARGO[d.getDay()]}, ${MESES_CORTO[d.getMonth()]} ${d.getDate()}`;
  return { etiqueta, iso };
};

const ORDEN_DIAS_ISO = () => {
  const hoy = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
};

// Construye los slots de 30 min dentro de la jornada laboral, descartando bloqueos
const construirSlots = (
  disp: DisponibilidadDTO | null,
): { disponible: string[]; ocupado: string[] } => {
  if (!disp || !disp.jornadaLaboral) return { disponible: [], ocupado: [] };
  const { inicio, fin } = disp.jornadaLaboral;
  const ocupados = (disp.bloquesOcupados || []).map((b) => ({
    inicio: b.hora_inicio.slice(0, 5),
    fin: b.hora_fin.slice(0, 5),
  }));

  const slots: string[] = [];
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  const inicioMin = hi * 60 + mi;
  const finMin = hf * 60 + mf;
  let t = inicioMin;
  while (t + 30 <= finMin) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    t += 30;
  }

  const disponible = slots.filter((s) => {
    const finSlot = new Date(`1970-01-01T${s}:00`);
    finSlot.setMinutes(finSlot.getMinutes() + 30);
    const finS = finSlot.toTimeString().slice(0, 5);
    return !ocupados.some(
      (o) => !(finS <= o.inicio || s >= o.fin),
    );
  });

  const ocupado = slots.filter((s) => !disponible.includes(s));
  return { disponible, ocupado };
};

export default function ClientPwa() {
  const servicios = useStore((s) => s.servicios);
  const sesion = useStore((s) => s.sesion);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: catálogo, 2: profesional, 3: fecha/hora, 4: pago, 5: éxito

  const [selectedService, setSelectedService] = useState<Service>(
    servicios[0] || initialServices[0],
  );
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [profesionalesCargando, setProfesionalesCargando] = useState(false);
  const [selectedProfesional, setSelectedProfesional] = useState<Profesional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateISO, setSelectedDateISO] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDTO | null>(null);
  const [disponibilidadCargando, setDisponibilidadCargando] = useState(false);
  const [pagoRequerido, setPagoRequerido] = useState<{
    monto: number;
    clientSecret: string;
    transaccionId: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fechas de los próximos 14 días
  const fechas = Array.from({ length: 14 }, (_, i) => fechaDesdeOffset(i));
  const diasISO = ORDEN_DIAS_ISO();

  // Cargar profesionales al elegir servicio (sucursal del servicio)
  useEffect(() => {
    if (step !== 2) return;
    setProfesionalesCargando(true);
    setError(null);
    listarProfesionales(selectedService?.sucursalId)
      .then((lista) => {
        setProfesionales(lista);
        if (lista.length === 1) {
          setSelectedProfesional(lista[0]);
          setStep(3);
        }
      })
      .catch(() => {
        setError("No pudimos cargar los profesionales. Intenta de nuevo.");
      })
      .finally(() => setProfesionalesCargando(false));
  }, [step, selectedService]);

  // Consultar disponibilidad al elegir fecha
  useEffect(() => {
    if (step !== 3 || !selectedProfesional || !selectedDateISO) return;
    setDisponibilidadCargando(true);
    setSelectedHour("");
    setDisponibilidad(null);
    (async () => {
      try {
        const d = await repositorios.turnos.obtenerDisponibilidad(
          selectedProfesional.id,
          selectedDateISO,
        );
        setDisponibilidad(d);
      } catch {
        try {
          const d = await turnosRepositorioMock.obtenerDisponibilidad(
            selectedProfesional.id,
            selectedDateISO,
          );
          setDisponibilidad(d);
        } catch {
          setDisponibilidad(null);
        }
      } finally {
        setDisponibilidadCargando(false);
      }
    })();
  }, [step, selectedProfesional, selectedDateISO]);

  const handleElegirServicio = (svc: Service) => {
    setSelectedService(svc);
    setSelectedProfesional(null);
    setSelectedDate("");
    setSelectedDateISO("");
    setSelectedHour("");
    setStep(2);
  };

  const handleElegirHora = async () => {
    if (!selectedHour) {
      setError("Selecciona una hora disponible.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const clienteId = sesion?.usuario.id;
      const resultado = await reservarTurno({
        cliente_id: clienteId || "cli-demo",
        profesional_id: selectedProfesional!.id,
        servicio_id: selectedService!.id,
        fecha: selectedDateISO,
        hora_inicio: SACAR_HORA_24H(selectedHour),
        cliente_nombre: sesion?.usuario.nombre || "Cliente",
        servicio_nombre: selectedService!.name,
        servicio_precio: selectedService!.price,
      });
      setPagoRequerido(resultado.pagoRequerido);
      setPagoConfirmado(false);
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo pre-reservar el turno.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagar = async () => {
    if (!pagoRequerido) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmarPago(pagoRequerido.transaccionId);
      setPagoConfirmado(true);
      setStep(5);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo confirmar el pago.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedHour("");
    setSelectedDate("");
    setSelectedDateISO("");
    setSelectedProfesional(null);
    setPagoRequerido(null);
    setPagoConfirmado(false);
    setError(null);
  };

  const pasoAnterior = () => {
    setError(null);
    if (step === 4 && pagoRequerido) {
      // Volver a elegir hora (la pre-reserva queda como pendiente, se purga sola)
      setPagoRequerido(null);
      setStep(3);
      return;
    }
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const { disponible, ocupado } = construirSlots(disponibilidad);

  return (
    <div className="w-full mx-auto select-none">
      <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col rounded-2xl transition-colors duration-200">
        <div className="flex-grow flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar relative select-none transition-colors">
          {/* Header Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center sticky top-0 z-40 transition-colors">
            {step > 1 ? (
              <button
                onClick={pasoAnterior}
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
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                Reservar Cita
              </span>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-600 dark:text-red-400">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <p className="text-[11px] font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          {/* STEP 1: SERVICES CATALOG */}
          {step === 1 && (
            <div className="p-4 space-y-6 flex-grow flex flex-col select-none">
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
                          <div className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Wallet size={10} />
                            Reserva con el 50% (
                            ${Math.round(svc.price * 0.5).toLocaleString("es-CO")})
                          </div>
                        </div>

                        <button
                          onClick={() => handleElegirServicio(svc)}
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

          {/* STEP 2: SELECT PROFESSIONAL */}
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
                  Elige el profesional que atenderá tu cita.
                </p>
              </div>

              {profesionalesCargando ? (
                <div className="flex items-center justify-center py-8">
                  <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                </div>
              ) : profesionales.length === 0 ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center py-8">
                  No hay profesionales disponibles para este servicio.
                </div>
              ) : (
                <div className="space-y-3">
                  {profesionales.map((prof) => (
                    <div
                      key={prof.id}
                      onClick={() => setSelectedProfesional(prof)}
                      className={`bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer shadow-sm ${
                        selectedProfesional?.id === prof.id
                          ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.4)]"
                          : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <UserRound size={18} />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">
                          {prof.nombre}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {prof.especialidad}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedProfesional?.id === prof.id
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {selectedProfesional?.id === prof.id && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-auto">
                <button
                  disabled={!selectedProfesional}
                  onClick={() => setStep(3)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-1 active:scale-95"
                >
                  Continuar
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE AND HOUR SLOT */}
          {step === 3 && (
            <div className="p-4 space-y-6 flex-grow flex flex-col select-none text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {selectedService.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {selectedService.name}
                </h3>
                {selectedProfesional && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Con <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProfesional.nombre}</span> — elige día y hora.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Fecha de Reserva
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {fechas.map((f, idx) => {
                    const d = diasISO[idx];
                    const dateObj = new Date(d + "T00:00:00");
                    return (
                      <div
                        key={d}
                        onClick={() => {
                          setSelectedDate(f.etiqueta);
                          setSelectedDateISO(d);
                        }}
                        className={`flex-shrink-0 w-12 py-2 rounded-xl text-center cursor-pointer transition-all border ${
                          selectedDateISO === d
                            ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <span className="block text-[10px] font-bold">
                          {DIAS_CORTO[dateObj.getDay()]}
                        </span>
                        <span className="block text-sm font-extrabold mt-0.5">
                          {dateObj.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Horas Disponibles
                </span>

                {disponibilidadCargando ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : selectedDateISO === "" ? (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-6">
                    Selecciona una fecha para ver las horas disponibles.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {disponible.map((hr) => {
                      const fmt = A_HORA12(hr);
                      return (
                        <div
                          key={hr}
                          onClick={() => setSelectedHour(fmt)}
                          className={`py-2 text-center rounded-xl cursor-pointer text-[11px] font-bold transition-all border ${
                            selectedHour === fmt
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-105"
                              : "bg-white dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/60"
                          }`}
                        >
                          {fmt}
                        </div>
                      );
                    })}
                    {disponible.length === 0 && (
                      <p className="col-span-full text-[11px] text-slate-400 dark:text-slate-500 text-center py-4">
                        Sin horarios disponibles en esta fecha.
                      </p>
                    )}
                  </div>
                )}

                {ocupado.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-600 tracking-wider">
                      Horas ocupadas
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ocupado.map((hr) => (
                        <div
                          key={hr}
                          className="py-2 text-center rounded-xl bg-slate-200/50 dark:bg-slate-900/40 border border-slate-300/40 dark:border-slate-800/40 line-through text-[11px] font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                        >
                          {A_HORA12(hr)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-auto">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <span className="block">Total</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    ${selectedService.price.toLocaleString("es-CO")}
                  </span>
                  <span className="block text-emerald-600 dark:text-emerald-400 normal-case font-semibold">
                    Reserva: ${Math.round(selectedService.price * 0.5).toLocaleString("es-CO")}
                  </span>
                </div>
                <button
                  onClick={handleElegirHora}
                  disabled={isSubmitting || !selectedHour}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-1 active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && pagoRequerido && (
            <div className="p-4 space-y-6 flex-grow flex flex-col select-none text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Pago de Reserva
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Abona el 50% para reservar
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tu espacio queda reservado al abonar el depósito de garantía.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Servicio:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedService.name}
                  </span>
                </div>
                {selectedProfesional && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Profesional:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProfesional.nombre}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Hora:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {selectedHour}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Valor del servicio:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    ${selectedService.price.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Depósito (50%):
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                    ${Math.round(pagoRequerido.monto).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-indigo-700 dark:text-indigo-300">
                <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-semibold leading-relaxed">
                  Pago seguro y encriptado. El depósito se descuenta del valor total
                  de tu servicio. Solo pagas ahora el 50% ({Math.round(pagoRequerido.monto).toLocaleString("es-CO")} COP).
                </p>
              </div>

              <button
                onClick={handlePagar}
                disabled={isSubmitting}
                className="w-full py-3 mt-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CreditCard size={14} className="text-slate-950" />
                )}
                {isSubmitting
                  ? "Procesando pago..."
                  : `Pagar $${Math.round(pagoRequerido.monto).toLocaleString("es-CO")}`}
              </button>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && (
            <div className="p-6 space-y-6 flex-grow flex flex-col justify-center text-center animate-scale-up select-none">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Check size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  ¡Cita Confirmada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Tu pago fue aprobado y tu espacio quedó reservado. Te
                  notificaremos a tu número de WhatsApp registrado.
                </p>
              </div>

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
                      Profesional:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {selectedProfesional?.nombre || "—"}
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
                      Depósito:
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {pagoRequerido ? `$${Math.round(pagoRequerido.monto).toLocaleString("es-CO")}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

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
                    alert(`¡Enviando ticket digital!`)
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
      </div>
    </div>
  );
}