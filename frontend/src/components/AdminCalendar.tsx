import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageSquare,
  Edit2,
  CalendarX,
  Check,
  Send,
  CheckCircle2,
  Search,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import { initialBookings } from "../data";
import { BookingEvent } from "../types";

type ViewMode = "diario" | "semanal" | "mensual";

export default function AdminCalendar() {
  const [bookings, setBookings] = useState<BookingEvent[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(
    null,
  );
  const [showToast, setShowToast] = useState<string | null>(null);

  // ESTADOS DE CONTROL DEL CALENDARIO
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 24)); // Octubre 24, 2026
  const [viewMode, setViewMode] = useState<ViewMode>("diario");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDatePickerModal, setShowDatePickerModal] =
    useState<boolean>(false);

  // Estados temporales para el menú modal de selección de fecha
  const [tempDay, setTempDay] = useState<number>(currentDate.getDate());
  const [tempMonth, setTempMonth] = useState<number>(currentDate.getMonth());
  const [tempYear, setTempYear] = useState<number>(currentDate.getFullYear());

  const hours = [
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

  const columns = [
    { id: "carlos", name: "Sillón 1", staff: "Carlos Gomez" },
    { id: "elena", name: "Sillón 2", staff: "Elena Ruiz" },
    { id: "marco", name: "Sillón 3", staff: "Marco Silva" },
    { id: "sofia", name: "Manicura", staff: "Sofía Luna" },
    { id: "ana", name: "Pedicura", staff: "Ana Belén" },
  ];

  const monthsList = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // NAVEGACIÓN DE FECHA (ANTERIOR / SIGUIENTE)
  const handleNavigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    const multiplier = direction === "next" ? 1 : -1;

    if (viewMode === "diario") {
      newDate.setDate(newDate.getDate() + 1 * multiplier);
    } else if (viewMode === "semanal") {
      newDate.setDate(newDate.getDate() + 7 * multiplier);
    } else if (viewMode === "mensual") {
      newDate.setMonth(newDate.getMonth() + 1 * multiplier);
    }
    setCurrentDate(newDate);
  };

  // APARTADO APLICAR SELECCIÓN DESDE EL MENÚ MODAL DE FECHA
  const handleApplyCustomDate = () => {
    setCurrentDate(new Date(tempYear, tempMonth, tempDay));
    setShowDatePickerModal(false);
  };

  const formattedDateLabel = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // FILTRADO DE RESERVAS POR BÚSQUEDA
  const filteredBookings = bookings.filter((b) => {
    return (
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAction = (type: string) => {
    if (!selectedBooking) return;
    if (type === "send_whatsapp") {
      setShowToast(
        `¡Recordatorio enviado a ${selectedBooking.clientName} exitosamente vía Evolution API! 🚀`,
      );
      setTimeout(() => setShowToast(null), 4000);
    } else if (type === "cancel") {
      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setShowToast(
        `Cita de ${selectedBooking.clientName} cancelada exitosamente.`,
      );
      setTimeout(() => setShowToast(null), 3000);
    } else if (type === "modify") {
      setShowToast(
        `Redireccionando al editor de citas para modificar el turno de ${selectedBooking.clientName}.`,
      );
      setTimeout(() => setShowToast(null), 3000);
    }
    setSelectedBooking(null);
  };

  // HELPER PARA VISTA SEMANAL (7 DÍAS A PARTIR DE LA FECHA ACTUAL)
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday =
      startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diffToMonday);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  // HELPER PARA VISTA MENSUAL (DÍAS DEL MES ACTIVO)
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek =
      firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 h-full flex flex-col relative transition-colors duration-200">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 shadow-2xl z-[100] animate-bounce flex items-center gap-3">
          <div className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {showToast}
          </p>
        </div>
      )}

      {/* Header controls for Calendar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex-wrap gap-4 shadow-sm dark:shadow-none transition-colors duration-200">
        {/* Selector de Modos de Vista */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200 dark:border-slate-800">
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

          {/* Campo de búsqueda */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 w-48 transition-all"
            />
          </div>
        </div>

        {/* Control de Fechas con Menú Modal y Navegación */}
        <div className="flex items-center gap-4 justify-between w-full md:w-auto">
          <button
            onClick={() => {
              setTempDay(currentDate.getDate());
              setTempMonth(currentDate.getMonth());
              setTempYear(currentDate.getFullYear());
              setShowDatePickerModal(true);
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group"
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
              className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleNavigateDate("next")}
              className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VISTA DIARIA */}
      {viewMode === "diario" && (
        <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-950/90 shadow-sm dark:shadow-2xl flex-grow overflow-x-auto custom-scrollbar transition-colors duration-200">
          <div className="min-w-[1000px] grid grid-cols-[100px_repeat(5,1fr)]">
            <div className="bg-slate-50 dark:bg-[#0b1120] h-14 border-b border-r border-slate-200 dark:border-slate-800/50 sticky top-0 z-30 flex items-center justify-center">
              <Clock size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
            {columns.map((col) => (
              <div
                key={col.id}
                className="bg-slate-50 dark:bg-[#0b1120] h-14 border-b border-r border-slate-200 dark:border-slate-800/50 sticky top-0 z-30 flex flex-col items-center justify-center p-2 text-center transition-all hover:bg-slate-100 dark:hover:bg-slate-900/60"
              >
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {col.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {col.staff}
                </span>
              </div>
            ))}

            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="h-24 border-b border-r border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#060814] flex items-start justify-end pr-3 pt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                  {hour}
                </div>

                {columns.map((col) => {
                  const match = filteredBookings.find(
                    (b) => b.timeStart === hour && b.columnId === col.id,
                  );
                  return (
                    <div
                      key={`${hour}-${col.id}`}
                      className="h-24 border-b border-r border-slate-200/80 dark:border-slate-800/20 bg-white dark:bg-slate-950/30 p-2 relative group hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {match ? (
                        <div
                          onClick={() => setSelectedBooking(match)}
                          className={`absolute inset-x-2 top-2 h-[80px] z-10 rounded-xl p-3 border-l-4 text-left transition-all hover:scale-[1.03] cursor-pointer shadow-md dark:shadow-lg active:scale-100 ${
                            match.color === "primary"
                              ? "bg-indigo-50/90 dark:bg-indigo-600/15 border-indigo-500 text-indigo-950 dark:text-indigo-100 hover:bg-indigo-100/90 dark:hover:bg-indigo-600/25"
                              : match.color === "secondary"
                                ? "bg-emerald-50/90 dark:bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100/90 dark:hover:bg-emerald-500/25"
                                : "bg-amber-50/90 dark:bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 hover:bg-amber-100/90 dark:hover:bg-amber-500/25"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span
                              className={
                                match.color === "primary"
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : match.color === "secondary"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-amber-600 dark:text-amber-500"
                              }
                            >
                              {match.serviceName}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                            {match.clientName}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {match.timeStart} - {match.timeEnd}
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[9px] text-indigo-400/60 dark:text-indigo-500/40 uppercase font-bold tracking-widest font-mono">
                            Disponible
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* VISTA SEMANAL */}
      {viewMode === "semanal" && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/90 shadow-sm p-4 flex-grow">
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((dayDate, idx) => {
              const isSelectedDay =
                dayDate.toDateString() === currentDate.toDateString();
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentDate(dayDate)}
                  className={`border rounded-xl p-3 min-h-[350px] cursor-pointer transition-all flex flex-col justify-between ${
                    isSelectedDay
                      ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md"
                      : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
                  }`}
                >
                  <div>
                    <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        {dayDate.toLocaleDateString("es-ES", {
                          weekday: "short",
                        })}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isSelectedDay
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {dayDate.getDate()}
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {filteredBookings.slice(0, 3).map((b, i) => (
                        <div
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="p-2 rounded-lg text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-[10px]"
                        >
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            {b.clientName}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">
                            {b.timeStart}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] text-center text-slate-400 block pt-2">
                    {filteredBookings.length} turnos
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA MENSUAL */}
      {viewMode === "mensual" && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/90 shadow-sm p-4 flex-grow">
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
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
                    className="h-24 bg-slate-100/30 dark:bg-slate-900/10 rounded-lg border border-transparent"
                  />
                );
              }
              const isSelectedDay =
                dayDate.toDateString() === currentDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => setCurrentDate(dayDate)}
                  className={`h-24 border rounded-lg p-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelectedDay
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md"
                      : "border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelectedDay
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded px-1 text-center">
                      4 Citas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom stats layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left shadow-sm dark:shadow-none select-none transition-colors duration-200">
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Check size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Turnos diarios
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              32 / 45
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Ingresos proyectados
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              $1,450.00
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Sin confirmar
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              04
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
            <CalendarX size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              Cancelaciones
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              02
            </p>
          </div>
        </div>
      </div>

      {/* MENÚ MODAL PARA SELECCIONAR FECHA ESPECÍFICA */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
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
              {/* Selección de Día */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Día
                </label>
                <select
                  value={tempDay}
                  onChange={(e) => setTempDay(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Mes */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Mes
                </label>
                <select
                  value={tempMonth}
                  onChange={(e) => setTempMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {monthsList.map((month, idx) => (
                    <option key={idx} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Año */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Año
                </label>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
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
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

      {/* Booking Context Management Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  Gestionar Cita
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedBooking.clientName} • Service Details
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 px-2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => handleAction("modify")}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-600/10 text-slate-700 dark:text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Edit2 size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-slate-100">
                    Modificar Cita
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Cambiar horario, servicio o profesional asignado.
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleAction("cancel")}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-rose-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 group-hover:bg-red-500/20 transition-colors">
                  <CalendarX size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-red-600 dark:text-red-400">
                    Cancelar Turno
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Libera este espacio inmediatamente en la agenda.
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleAction("send_whatsapp")}
                className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-600/10 text-slate-700 dark:text-slate-200 text-left transition-all group"
              >
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    Enviar Recordatorio Manual
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Notificar al cliente vía SMS/Whatsapp con Evolution Link.
                  </span>
                </div>
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowToast("Cargando ficha del cliente...");
                  setTimeout(() => setShowToast(null), 3000);
                }}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
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
