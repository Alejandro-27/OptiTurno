import React from "react";
import type { DisponibilidadDTO } from "../../api/dto";
import Skeleton from "../Skeleton";

const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const A_HORA12 = (hora24: string): string => {
  const [h, m] = hora24.split(":").map(Number);
  const esPM = h >= 12;
  const hora12 = (h % 12 || 12).toString().padStart(2, "0");
  return `${hora12}:${String(m).padStart(2, "0")} ${esPM ? "PM" : "AM"}`;
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
    return !ocupados.some((o) => !(finS <= o.inicio || s >= o.fin));
  });

  const ocupado = slots.filter((s) => !disponible.includes(s));
  return { disponible, ocupado };
};

interface Props {
  disponibilidad: DisponibilidadDTO | null;
  cargando: boolean;
  fechas: { etiqueta: string; iso: string }[];
  fechaSeleccionadaISO: string;
  horaSeleccionada: string;
  onSelectFecha: (iso: string, etiqueta: string) => void;
  onSelectHora: (hora12: string) => void;
}

/** Paso 3 del flujo: rail de fechas + grilla de horas (design.md §6.2). */
export default function SlotScheduler({
  disponibilidad,
  cargando,
  fechas,
  fechaSeleccionadaISO,
  horaSeleccionada,
  onSelectFecha,
  onSelectHora,
}: Props) {
  const { disponible, ocupado } = construirSlots(disponibilidad);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="label-overline block">Fecha de Reserva</span>
        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
          {fechas.map((f) => {
            const dateObj = new Date(f.iso + "T00:00:00");
            const activo = fechaSeleccionadaISO === f.iso;
            return (
              <button
                key={f.iso}
                type="button"
                onClick={() => onSelectFecha(f.iso, f.etiqueta)}
                aria-pressed={activo}
                className={`flex w-12 flex-shrink-0 cursor-pointer flex-col rounded-xl border py-2 text-center transition-all ${
                  activo
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "border-border-subtle bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <span className="text-[10px] font-bold">
                  {DIAS_CORTO[dateObj.getDay()]}
                </span>
                <span className="mt-0.5 font-mono text-sm font-extrabold">
                  {dateObj.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className="label-overline block">Horas Disponibles</span>

        {cargando ? (
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-xl" />
            ))}
          </div>
        ) : fechaSeleccionadaISO === "" ? (
          <p className="py-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Selecciona una fecha para ver las horas disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {disponible.map((hr) => {
              const fmt = A_HORA12(hr);
              return (
                <button
                  key={hr}
                  type="button"
                  onClick={() => onSelectHora(fmt)}
                  aria-pressed={horaSeleccionada === fmt}
                  className={`chip ${horaSeleccionada === fmt ? "chip-selected" : ""}`}
                >
                  {fmt}
                </button>
              );
            })}
            {disponible.length === 0 && (
              <p className="col-span-full py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
                Sin horarios disponibles en esta fecha.
              </p>
            )}
          </div>
        )}

        {ocupado.length > 0 && (
          <div className="space-y-2">
            <span className="label-overline block text-slate-400 dark:text-slate-600">
              Horas ocupadas
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ocupado.map((hr) => (
                <span key={hr} className="chip chip-disabled">
                  {A_HORA12(hr)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
