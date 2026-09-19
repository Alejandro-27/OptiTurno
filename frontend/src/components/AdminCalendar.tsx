import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  DollarSign,
  Check,
  CalendarX,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import type { BookingEvent } from "../types";
import { useStore } from "../store";
import ModalEditarCita from "./ModalEditarCita";

type ViewMode = "diario" | "semanal" | "mensual";

const HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const INICIO_JORNADA = minutosDe(HOURS[0]);
const PIXELES_POR_HORA = 96;
const ALTURA_GRILLA = HOURS.length * PIXELES_POR_HORA;

function minutosDe(hora: string): number {
  const [h = 0, m = 0] = hora.split(":").map(Number);
  return h * 60 + m;
}

function fechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${mes}-${dia}`;
}

function duracionMin(b: BookingEvent): number {
  const fin = minutosDe(b.timeEnd);
  const ini = minutosDe(b.timeStart);
  if (fin > ini) return fin - ini;
  return b.duracionMin || 30;
}

function formatearMoneda(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default function AdminCalendar() {
  const bookings = useStore((s) => s.turnos);
  const profesionales = useStore((s) => s.profesionales);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(
    null,
  );

  // ESTADOS DE CONTROL DEL CALENDARIO
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("diario");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mostrarCancelados, setMostrarCancelados] = useState<boolean>(false);
  const [showDatePickerModal, setShowDatePickerModal] =
    useState<boolean>(false);

  // Estados temporales para el menú modal de selección de fecha
  const [tempDay, setTempDay] = useState<number>(currentDate.getDate());
  const [tempMonth, setTempMonth] = useState<number>(currentDate.getMonth());
  const [tempYear, setTempYear] = useState<number>(currentDate.getFullYear());

  const columns = profesionales.slice(0, 5).map((p, i) => ({
    id: p.id,
    name: `Sillón ${i + 1}`,
    staff: p.nombre,
  }));

  // NAVEGACIÓN DE FECHA (ANTERIOR / SIGUIENTE)
  const handleNavigateDate = (direction: "prev" | "next") => {
    const nueva = new Date(currentDate);
    const multiplicador = direction === "next" ? 1 : -1;
    if (viewMode === "diario") {
      nueva.setDate(nueva.getDate() + 1 * multiplicador);
    } else if (viewMode === "semanal") {
      nueva.setDate(nueva.getDate() + 7 * multiplicador);
    } else {
      nueva.setMonth(nueva.getMonth() + 1 * multiplicador);
    }
    setCurrentDate(nueva);
  };

  const handleApplyCustomDate = () => {
    setCurrentDate(new Date(tempYear, tempMonth, tempDay));
    setShowDatePickerModal(false);
  };

  const formattedDateLabel = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Turnos visibles: se ocultan los cancelados salvo que el toggle esté activo.
  const turnosVisibles = bookings.filter(
    (b) => mostrarCancelados || b.estado !== "cancelado",
  );

  const turnosBuscados = turnosVisibles.filter((b) => {
    const termino = searchTerm.trim().toLowerCase();
    if (!termino) return true;
    return (
      b.clientName.toLowerCase().includes(termino) ||
      b.serviceName.toLowerCase().includes(termino)
    );
  });

  const turnosDelDia = (dia: Date): BookingEvent[] =>
    turnosBuscados.filter((b) => b.fecha === fechaISO(dia));

  const turnosHoy = turnosDelDia(currentDate);
  const canceladosHoy = bookings.filter(
    (b) => b.fecha === fechaISO(currentDate) && b.estado === "cancelado",
  );
  const pendientesHoy = turnosHoy.filter((b) => b.estado === "pendiente_pago");
  const ingresosHoy = turnosHoy.reduce(
    (total, b) => total + (b.precio || 0),
    0,
  );
  const slotsHoy = Math.max(HOURS.length * columns.length, 1);

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const diaSemana = startOfWeek.getDay();
    const diffToMonday =
      startOfWeek.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    startOfWeek.setDate(diffToMonday);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];
    const startingDayOfWeek =
      firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 h-full flex flex-col relative transition-colors duration-200 overflow-y-auto pr-1">
      {/* Header controls for Calendar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/40 p-4 border border-border-subtle dark:border-slate-800 rounded-xl flex-wrap gap-4 shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-border-subtle dark:border-slate-800">
            <button
              onClick={() => setViewMode("diario")}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === "diario"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setViewMode("semanal")}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === "semanal"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode("mensual")}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === "mensual"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Mensual
            </button>
          </div>

          <div className="relative flex items-center w-full sm:w-auto">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 w-full md:w-48 transition-all"
            />
          </div>

          {/* Toggle mostrar cancelados */}
          <button
            onClick={() => setMostrarCancelados((v) => !v)}
            aria-pressed={mostrarCancelados}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              mostrarCancelados
                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-slate-50 dark:bg-slate-950 border-border-subtle dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {mostrarCancelados ? <Eye size={13} /> : <EyeOff size={13} />}
            Mostrar cancelados
          </button>
        </div>

        <div className="flex items-center gap-4 justify-between w-full md:w-auto">
          <button
            onClick={() => {
              setTempDay(currentDate.getDate());
              setTempMonth(currentDate.getMonth());
              setTempYear(currentDate.getFullYear());
              setShowDatePickerModal(true);
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 px-4 py-2 rounded-lg border border-border-subtle dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group"
          >
            <CalendarIcon
              size={14}
              className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"
            />
            <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 capitalize">
              {formattedDateLabel}
            </span>
          </button>

          <div className="flex gap-1">
            <button
              onClick={() => handleNavigateDate("prev")}
              className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Fecha anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleNavigateDate("next")}
              className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Fecha siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VISTA DIARIA */}
      {viewMode === "diario" && (
        <div className="border border-border-subtle dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-950/90 shadow-sm dark:shadow-2xl flex-grow overflow-x-auto custom-scrollbar transition-colors duration-200">
          <div className="min-w-[520px] md:min-w-[1000px]">
            {/* Encabezado de columnas */}
            <div className="grid grid-cols-[70px_repeat(2,1fr)] md:grid-cols-[100px_repeat(5,1fr)] sticky top-0 z-30">
              <div className="bg-slate-50 dark:bg-slate-950 h-14 border-b border-r border-border-subtle dark:border-slate-800/50 flex items-center justify-center">
                <Clock
                  size={16}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>
              {columns.map((col, i) => (
                <div
                  key={col.id}
                  className={`bg-slate-50 dark:bg-slate-950 h-14 border-b border-r border-border-subtle dark:border-slate-800/50 flex flex-col items-center justify-center p-2 text-center transition-all hover:bg-slate-100 dark:hover:bg-slate-900/60 ${
                    i >= 2 ? "hidden md:flex" : ""
                  }`}
                >
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {col.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-full">
                    {col.staff}
                  </span>
                </div>
              ))}
            </div>

            {/* Cuerpo horario con posicionamiento proporcional */}
            <div className="grid grid-cols-[70px_repeat(2,1fr)] md:grid-cols-[100px_repeat(5,1fr)]">
              <div
                className="relative border-r border-border-subtle dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950"
                style={{ height: ALTURA_GRILLA }}
              >
                {HOURS.map((hour, i) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-b border-border-subtle dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono"
                    style={{
                      top: i * PIXELES_POR_HORA,
                      height: PIXELES_POR_HORA,
                    }}
                  >
                    <span className="absolute right-2 top-1.5">{hour}</span>
                  </div>
                ))}
              </div>

              {columns.map((col, i) => {
                const citas = turnosHoy.filter((b) => b.columnId === col.id);
                return (
                  <div
                    key={col.id}
                    className={`relative border-r border-border-subtle/80 dark:border-slate-800/20 bg-white dark:bg-slate-950/30 ${
                      i >= 2 ? "hidden md:block" : ""
                    }`}
                    style={{ height: ALTURA_GRILLA }}
                  >
                    {HOURS.map((hour, j) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-b border-border-subtle/80 dark:border-slate-800/20"
                        style={{ top: j * PIXELES_POR_HORA }}
                      />
                    ))}
                    {citas.map((b) => {
                      const alto = Math.max(
                        (duracionMin(b) / 60) * PIXELES_POR_HORA,
                        26,
                      );
                      const top = Math.max(
                        ((minutosDe(b.timeStart) - INICIO_JORNADA) / 60) *
                          PIXELES_POR_HORA,
                        4,
                      );
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBooking(b)}
                          className={`absolute left-1 right-1 z-10 rounded-xl p-2 border-l-4 text-left overflow-hidden transition-all hover:scale-[1.01] hover:z-20 cursor-pointer shadow-md dark:shadow-lg ${
                            b.color === "primary"
                              ? "bg-indigo-50/90 dark:bg-indigo-600/15 border-indigo-500 text-indigo-950 dark:text-indigo-100 hover:bg-indigo-100/90 dark:hover:bg-indigo-600/25"
                              : b.color === "secondary"
                                ? "bg-emerald-50/90 dark:bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/90 dark:hover:bg-emerald-500/25"
                                : "bg-amber-50/90 dark:bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 hover:bg-amber-100/90 dark:hover:bg-amber-500/25"
                          }`}
                          style={{ top, height: alto }}
                        >
                          <p
                            className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider truncate ${
                              b.color === "primary"
                                ? "text-indigo-600 dark:text-indigo-400"
                                : b.color === "secondary"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-500"
                            }`}
                          >
                            {b.serviceName}
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {b.clientName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {b.timeStart} - {b.timeEnd}
                          </p>
                          {b.estado === "cancelado" && (
                            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">
                              Cancelado
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {columns.length === 0 && (
                <div
                  className="col-span-2 md:col-span-5 border-r border-border-subtle dark:border-slate-800/20"
                  style={{ height: ALTURA_GRILLA }}
                >
                  <p className="p-4 text-center text-xs text-slate-400">
                    No hay profesionales configurados todavía.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA SEMANAL */}
      {viewMode === "semanal" && (
        <div className="border border-border-subtle dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/90 shadow-sm p-4 flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {getWeekDays().map((dayDate, idx) => {
              const esDiaSeleccionado =
                dayDate.toDateString() === currentDate.toDateString();
              const citas = turnosDelDia(dayDate);
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentDate(dayDate)}
                  className={`border rounded-xl p-3 min-h-[140px] sm:min-h-[350px] cursor-pointer transition-all flex flex-col justify-between ${
                    esDiaSeleccionado
                      ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md"
                      : "border-border-subtle dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
                  }`}
                >
                  <div>
                    <div className="text-center pb-2 border-b border-border-subtle dark:border-slate-800">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        {dayDate.toLocaleDateString("es-ES", {
                          weekday: "short",
                        })}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          esDiaSeleccionado
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {dayDate.getDate()}
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {citas.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="p-2 rounded-lg text-left bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 shadow-sm text-[10px]"
                        >
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            {b.clientName}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">
                            {b.timeStart} - {b.timeEnd}
                          </p>
                        </div>
                      ))}
                      {citas.length === 0 && (
                        <p className="text-center text-[10px] text-slate-300 dark:text-slate-600">
                          Sin turnos
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-center text-slate-400 block pt-2">
                    {citas.length} {citas.length === 1 ? "turno" : "turnos"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA MENSUAL */}
      {viewMode === "mensual" && (
        <div className="border border-border-subtle dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/90 shadow-sm p-4 flex-1 min-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white dark:bg-slate-950 py-1 z-10">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getMonthDays().map((dayDate, idx) => {
              if (!dayDate) {
                return (
                  <div
                    key={idx}
                    className="h-16 bg-slate-50/50 dark:bg-slate-900/10 rounded-lg border border-slate-100/50 dark:border-slate-800/30"
                  />
                );
              }
              const esDiaSeleccionado =
                dayDate.toDateString() === currentDate.toDateString();
              const cantidad = turnosDelDia(dayDate).length;

              return (
                <div
                  key={idx}
                  onClick={() => setCurrentDate(dayDate)}
                  className={`h-14 sm:h-16 p-1 border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${
                    esDiaSeleccionado
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm"
                      : "border-border-subtle/80 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-bold ${
                      esDiaSeleccionado
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>

                  <div className="mt-0.5">
                    {cantidad > 0 && (
                      <span className="hidden sm:block text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded py-0.5 px-1 text-center truncate">
                        {cantidad} Citas
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Métricas dinámicas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl text-left shadow-sm dark:shadow-none select-none transition-colors duration-200">
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-border-subtle/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Check size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Turnos diarios
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              {turnosHoy.length} / {slotsHoy}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-border-subtle/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Ingresos proyectados
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              {formatearMoneda(ingresosHoy)}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-border-subtle/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Sin confirmar
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              {String(pendientesHoy.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-border-subtle/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
            <CalendarX size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Cancelaciones
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              {String(canceladosHoy.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* MENÚ MODAL PARA SELECCIONAR FECHA ESPECÍFICA */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon size={16} className="text-indigo-500" />
                Seleccionar Fecha
              </h3>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Día
                </label>
                <select
                  value={tempDay}
                  onChange={(e) => setTempDay(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Año
                </label>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="flex-1 py-2 rounded-lg border border-border-subtle dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCustomDate}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición del turno (acciones reales conectadas a la API) */}
      {selectedBooking && (
        <ModalEditarCita
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
