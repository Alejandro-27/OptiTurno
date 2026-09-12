import React from "react";
import { CalendarPlus, Check, Mail } from "lucide-react";
import type { Profesional, Service } from "../../types";

interface Props {
  servicio: Service;
  profesional: Profesional | null;
  hora: string;
  fecha: string;
  onGoogle: () => void;
  onWhatsApp: () => void;
  onAgendarOtro: () => void;
}

/** Confirmación de reserva — resumen del ticket (design.md §6.2). */
export default function TicketResumen({
  servicio,
  profesional,
  hora,
  fecha,
  onGoogle,
  onWhatsApp,
  onAgendarOtro,
}: Props) {
  const precio = `$${servicio.price.toLocaleString("es-CO")}`;

  return (
    <div className="animate-scale-up flex flex-col justify-center space-y-6 px-2 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:text-emerald-400">
        <Check size={32} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          ¡Cita Confirmada con Éxito!
        </h3>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Tu espacio quedó reservado. Te notificaremos a tu número de
          WhatsApp registrado.
        </p>
      </div>

      <div className="card relative space-y-3.5 overflow-hidden p-4 text-left shadow-sm">
        <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-emerald-500/5 blur-xl"></div>

        <div>
          <span className="label-overline block">Resumen del Ticket</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {servicio.name}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[10px] dark:border-slate-800/80">
          <div>
            <dt className="label-overline block">Profesional</dt>
            <dd className="mt-0.5 block font-bold text-slate-800 dark:text-slate-200">
              {profesional?.nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="label-overline block">Franja</dt>
            <dd className="mt-0.5 block font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {hora}
            </dd>
          </div>
          <div>
            <dt className="label-overline block">Día asignado</dt>
            <dd className="mt-0.5 block font-bold text-slate-800 dark:text-slate-200">
              {fecha}
            </dd>
          </div>
          <div>
            <dt className="label-overline block">Valor</dt>
            <dd className="mt-0.5 block font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {precio}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 pt-2">
        <button onClick={onGoogle} className="btn btn-secondary w-full py-2.5">
          <CalendarPlus size={13} />
          Agregar a Google Calendar
        </button>
        <button onClick={onWhatsApp} className="btn btn-primary w-full py-2.5">
          <Mail size={13} />
          Enviar Ticket por WhatsApp
        </button>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-4 dark:border-slate-900">
        <button onClick={onAgendarOtro} className="btn btn-ghost px-4 py-2">
          Agendar Otro Turno
        </button>
      </div>
    </div>
  );
}