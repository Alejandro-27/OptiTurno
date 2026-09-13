import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";
import { initialServices } from "../data";
import { repositorios, turnosRepositorioMock } from "../data/index";
import type { Service, Profesional } from "../types";
import { reservarTurno, listarProfesionales, useStore } from "../store";
import type { DisponibilidadDTO } from "../api/dto";
import { guardarUltimoTurno } from "../utils/ultimoTurno";
import BookingSteps from "./booking/BookingSteps";
import ServiceCard from "./booking/ServiceCard";
import ProfesionalPicker from "./booking/ProfesionalPicker";
import SlotScheduler from "./booking/SlotScheduler";
import BookingWizardSkeleton from "./skeletons/BookingWizardSkeleton";

const SACAR_HORA_24H = (hora12: string): string => {
  const [hora, minutos] = hora12
    .replace(/\s*(AM|PM)/i, "")
    .split(":")
    .map(Number);
  const esPM = /PM/i.test(hora12);
  const hora24 = esPM ? (hora % 12) + 12 : hora % 12;
  return `${String(hora24).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
};

const DIAS_LARGO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MESES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Genera una etiqueta legible tipo "Jueves, Oct 24" y la fecha ISO de hoy + offset
const fechaDesdeOffset = (
  offset: number,
): { etiqueta: string; iso: string } => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const iso = d.toISOString().slice(0, 10);
  const etiqueta = `${DIAS_LARGO[d.getDay()]}, ${MESES_CORTO[d.getMonth()]} ${d.getDate()}`;
  return { etiqueta, iso };
};

export default function ClientPwa() {
  const servicios = useStore((s) => s.servicios);
  const sesion = useStore((s) => s.sesion);
  const inicializado = useStore((s) => s.inicializado);
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: catálogo, 2: profesional, 3: fecha/hora

  const [selectedService, setSelectedService] = useState<Service>(
    servicios[0] || initialServices[0],
  );
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [profesionalesCargando, setProfesionalesCargando] = useState(false);
  const [selectedProfesional, setSelectedProfesional] =
    useState<Profesional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateISO, setSelectedDateISO] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [disponibilidad, setDisponibilidad] =
    useState<DisponibilidadDTO | null>(null);
  const [disponibilidadCargando, setDisponibilidadCargando] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fechas de los próximos 14 días
  const fechas = Array.from({ length: 14 }, (_, i) => fechaDesdeOffset(i));

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
      await reservarTurno({
        cliente_id: clienteId || "cli-demo",
        profesional_id: selectedProfesional!.id,
        servicio_id: selectedService!.id,
        fecha: selectedDateISO,
        hora_inicio: SACAR_HORA_24H(selectedHour),
        cliente_nombre: sesion?.usuario.nombre || "Cliente",
        servicio_nombre: selectedService!.name,
        servicio_precio: selectedService!.price,
      });
      guardarUltimoTurno({
        servicioNombre: selectedService.name,
        servicioPrecio: selectedService.price,
        servicioDuracion: selectedService.duration,
        profesionalNombre: selectedProfesional?.nombre || "—",
        hora: selectedHour,
        fecha: selectedDate,
        fechaISO: selectedDateISO,
        horaInicio: SACAR_HORA_24H(selectedHour),
      });
      navigate("/confirmacion");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo pre-reservar el turno.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pasoAnterior = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3);
  };

  const infoServicio = (
    <div className="space-y-1 text-left">
      <span className="label-overline block">{selectedService.category}</span>
      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-50">
        {selectedService.name}
      </h3>
      {step === 3 && selectedProfesional && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Con{" "}
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {selectedProfesional.nombre}
          </span>{" "}
          — elige día y hora.
        </p>
      )}
      {step === 2 && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Elige el profesional que atenderá tu cita.
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full select-none">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex flex-grow flex-col overflow-y-auto bg-slate-50 custom-scrollbar dark:bg-slate-950">
          {/* Header Bar */}
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/85 p-4 backdrop-blur-lg transition-colors dark:border-slate-800/80 dark:bg-slate-900/85">
            {step > 1 ? (
              <button
                onClick={pasoAnterior}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <ArrowLeft size={15} />
                Volver
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Studio OptiTurno
                </span>
              </div>
            )}
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400">
              Reservar Cita
            </span>
          </div>

          {/* Progreso */}
          <div className="px-4 pt-4">
            <BookingSteps paso={step} />
          </div>

          {error && (
            <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-600 dark:text-red-400">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <p className="text-[11px] font-semibold leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* STEP 1: SERVICES CATALOG */}
          {step === 1 &&
            (!inicializado ? (
              <div className="flex flex-grow flex-col space-y-6 p-4">
                <BookingWizardSkeleton />
              </div>
            ) : (
              <div className="flex flex-grow flex-col space-y-6 p-4">
                <div className="relative flex h-28 flex-col justify-end overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-sm dark:border-slate-800 dark:from-purple-900 dark:to-slate-950">
                  <div className="relative z-20 space-y-1">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          size={11}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                      <span className="pl-1 text-[9px] font-bold text-white/90">
                        5.0 (250 reseñas)
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-semibold leading-none text-white">
                      Cortes & Estilo Masculino
                    </h3>
                    <p className="flex items-center gap-1 text-[10px] text-indigo-100 dark:text-slate-300">
                      <MapPin size={10} /> Sede Bogotá Centro
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="label-overline block">
                    Servicios Disponibles
                  </span>
                  <div className="space-y-3">
                    {(servicios.length > 0 ? servicios : initialServices).map(
                      (svc) => (
                        <ServiceCard
                          key={svc.id}
                          svc={svc}
                          onSelect={handleElegirServicio}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* STEP 2: SELECT PROFESSIONAL */}
          {step === 2 && (
            <div className="flex flex-grow flex-col space-y-6 p-4 text-left">
              {infoServicio}
              <ProfesionalPicker
                profesionales={profesionales}
                cargando={profesionalesCargando}
                seleccionado={selectedProfesional}
                onSelect={setSelectedProfesional}
              />
              <div className="mt-auto flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800/80">
                <button
                  disabled={!selectedProfesional}
                  onClick={() => setStep(3)}
                  className="btn btn-primary py-2 px-4"
                >
                  Continuar
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE AND HOUR SLOT */}
          {step === 3 && (
            <div className="flex flex-grow flex-col space-y-6 p-4 text-left">
              {infoServicio}
              <SlotScheduler
                disponibilidad={disponibilidad}
                cargando={disponibilidadCargando}
                fechas={fechas}
                fechaSeleccionadaISO={selectedDateISO}
                horaSeleccionada={selectedHour}
                onSelectFecha={(iso, etiqueta) => {
                  setSelectedDate(etiqueta);
                  setSelectedDateISO(iso);
                }}
                onSelectHora={setSelectedHour}
              />
              <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800/80">
                <div className="label-overline">
                  <span className="block">Total</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${selectedService.price.toLocaleString("es-CO")}
                  </span>
                </div>
                <button
                  onClick={handleElegirHora}
                  disabled={isSubmitting || !selectedHour}
                  className="btn btn-primary py-2 px-4"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
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
        </div>
      </div>
    </div>
  );
}
