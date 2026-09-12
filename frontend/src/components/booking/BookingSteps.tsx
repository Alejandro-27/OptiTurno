import React from "react";

const PASOS = ["Servicio", "Profesional", "Fecha y hora"];

interface Props {
  paso: number;
  completado?: boolean;
}

/** Indicador de progreso del flujo de reserva (design.md §6.2). */
export default function BookingSteps({ paso, completado = false }: Props) {
  const activo = completado ? PASOS.length : paso;
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {PASOS.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < activo ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
      <p className="label-overline">
        Paso {completado ? PASOS.length : Math.min(paso, PASOS.length)} de{" "}
        {PASOS.length}
      </p>
    </div>
  );
}