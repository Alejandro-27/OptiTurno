import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarPlus,
  CalendarClock,
  Check,
  History,
  Mail,
} from "lucide-react";
import { cargarMisTurnos, useStore } from "../store";
import type { MisTurnoDTO } from "../api/dto";
import {
  leerUltimoTurno,
  type ResumenTurnoReservado,
} from "../utils/ultimoTurno";
import Breadcrumbs from "./Breadcrumbs";

const pad = (n: number): string => String(n).padStart(2, "0");

function formateoCalendario(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function enlaceGoogleCalendar(
  r: ResumenTurnoReservado | null,
): string | undefined {
  if (!r || !r.fechaISO || !r.horaInicio) return undefined;
  const [hh, mm] = r.horaInicio.split(":").map(Number);
  const inicio = new Date(`${r.fechaISO}T00:00:00`);
  inicio.setHours(hh, mm);
  const fin = new Date(inicio.getTime() + (r.servicioDuracion || 60) * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${r.servicioNombre} — OptiTurno`,
    dates: `${formateoCalendario(inicio)}/${formateoCalendario(fin)}`,
    details: `Turno reservado con ${r.profesionalNombre} a través de OptiTurno.`,
    location: "Studio OptiTurno",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function enlaceWhatsApp(r: ResumenTurnoReservado | null): string | undefined {
  if (!r) return undefined;
  const texto =
    `Hola, te confirmo mi turno en OptiTurno:\n` +
    `- ${r.servicioNombre}\n- ${r.fecha} a las ${r.hora}\n- Profesional: ${r.profesionalNombre}`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function resumenDesdeMisTurnos(
  turno: MisTurnoDTO | undefined,
): ResumenTurnoReservado | null {
  if (!turno) return null;
  return {
    servicioNombre: turno.servicios?.nombre || "Servicio",
    servicioPrecio: turno.servicios?.precio,
    profesionalNombre: turno.profesionales?.usuarios.nombre || "Profesional",
    hora: turno.hora_inicio.slice(0, 5),
    fecha: formatearFecha(turno.fecha),
    fechaISO: turno.fecha,
    horaInicio: turno.hora_inicio.slice(0, 5),
  };
}

/** Confirmación post-reserva en /confirmacion (antes era el paso 5 inline). */
export default function ConfirmacionView() {
  const location = useLocation();
  const misTurnos = useStore((s) => s.misTurnos);
  const [expectativa, setExpectativa] = useState<ResumenTurnoReservado | null>(
    null,
  );

  const estadoRuta =
    (location.state as ResumenTurnoReservado | null) ?? leerUltimoTurno();
  const resumen =
    estadoRuta ?? resumenDesdeMisTurnos(misTurnos[0]) ?? expectativa;

  useEffect(() => {
    if (estadoRuta) return;
    cargarMisTurnos()
      .then((turnos) => setExpectativa(resumenDesdeMisTurnos(turnos[0])))
      .catch(() => undefined);
  }, [estadoRuta]);

  const calendarUrl = enlaceGoogleCalendar(resumen);
  const whatsappUrl = enlaceWhatsApp(resumen);

  return (
    <div className="space-y-5">
      <Breadcrumbs />

      {!resumen ? (
        <div className="card flex flex-col items-center space-y-4 p-6 text-center">
          <CalendarClock
            size={28}
            className="text-indigo-600 dark:text-indigo-400"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No encontramos información de una reserva reciente. Revisá tus
            turnos para ver el estado de tus citas.
          </p>
          <Link to="/turnos" className="btn btn-primary px-4 py-2">
            <History size={14} />
            Ver mis turnos
          </Link>
        </div>
      ) : (
        <div className="animate-scale-up flex flex-col space-y-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:text-emerald-400">
              <Check size={32} />
            </div>
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
                {resumen.servicioNombre}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[10px] dark:border-slate-800/80">
              <div>
                <dt className="label-overline block">Profesional</dt>
                <dd className="mt-0.5 block font-bold text-slate-800 dark:text-slate-200">
                  {resumen.profesionalNombre}
                </dd>
              </div>
              <div>
                <dt className="label-overline block">Franja</dt>
                <dd className="mt-0.5 block font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {resumen.hora}
                </dd>
              </div>
              <div>
                <dt className="label-overline block">Día asignado</dt>
                <dd className="mt-0.5 block font-bold text-slate-800 dark:text-slate-200">
                  {resumen.fecha}
                </dd>
              </div>
              <div>
                <dt className="label-overline block">Valor</dt>
                <dd className="mt-0.5 block font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {resumen.servicioPrecio
                    ? `$${resumen.servicioPrecio.toLocaleString("es-CO")}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/turnos" className="btn btn-primary w-full py-2.5">
              <History size={13} />
              Ver Mis Turnos
            </Link>
            {calendarUrl && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full py-2.5"
              >
                <CalendarPlus size={13} />
                Agregar a Google Calendar
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full py-2.5"
              >
                <Mail size={13} />
                Enviar Ticket por WhatsApp
              </a>
            )}
          </div>

          <div className="border-t border-dashed border-slate-200 pt-4 dark:border-slate-900">
            <Link to="/reservar" className="btn btn-ghost px-4 py-2">
              Agendar Otro Turno
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
