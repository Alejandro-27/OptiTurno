import React, { useMemo } from "react";
import {
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  Mail,
  Inbox,
} from "lucide-react";
import { useStore } from "../store";

const HOY_ISO = new Date().toISOString().slice(0, 10);
const MES_ACTUAL = HOY_ISO.slice(0, 7);

const ACTIVOS = new Set(["confirmado", "pendiente_pago"]);

export default function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const turnos = useStore((s) => s.turnos);
  const logs = useStore((s) => s.logs);

  // Métricas calculadas sobre datos reales (no hardcodeadas).
  const metricas = useMemo(() => {
    const completados = turnos.filter((t) => t.estado === "completado");
    const ingresosMes = completados
      .filter((t) => (t.fecha || "").startsWith(MES_ACTUAL))
      .reduce((suma, t) => suma + (t.precio ?? 0), 0);
    const activas = turnos.filter((t) => ACTIVOS.has(t.estado || ""));
    const citasHoy = turnos.filter(
      (t) => t.fecha === HOY_ISO && ACTIVOS.has(t.estado || ""),
    );
    const canceladas = turnos.filter((t) => t.estado === "cancelado").length;
    const inasistencia = turnos.length
      ? Math.round((canceladas / turnos.length) * 100)
      : 0;
    return {
      ingresosMes,
      activas: activas.length,
      citasHoy: citasHoy.length,
      inasistencia,
      total: turnos.length,
    };
  }, [turnos]);

  const sinDatos = metricas.total === 0;

  return (
    <div className="animate-fade-in space-y-6 text-slate-800 transition-colors duration-200 dark:text-slate-100">
      {/* KPI Grid — todos derivados del calendario real */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Ingresos del mes (turnos completados) */}
        <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl dark:hover:border-slate-700">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ingresos del mes
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            ${metricas.ingresosMes.toLocaleString("es-CO")}
          </p>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {sinDatos
              ? "Sin turnos aún"
              : `de ${metricas.total} turnos registrados`}
          </span>
        </div>

        {/* KPI 2: Reservas activas */}
        <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl dark:hover:border-slate-700">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reservas activas
            </span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Calendar size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-indigo-600 dark:text-indigo-300">
            {metricas.activas}
          </p>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {metricas.citasHoy === 0
              ? "Sin citas para hoy"
              : `${metricas.citasHoy} citas para hoy`}
          </span>
        </div>

        {/* KPI 3: Citas para hoy */}
        <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl dark:hover:border-slate-700">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Citas hoy
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {metricas.citasHoy}
          </p>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            turnos confirmados o pendientes
          </span>
        </div>

        {/* KPI 4: Tasa de cancelación */}
        <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl dark:hover:border-slate-700">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cancelaciones
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-amber-600 dark:text-amber-500">
            {metricas.inasistencia}%
          </p>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            de los turnos fueron cancelados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Resumen del día / calendario */}
        <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Agenda de hoy
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Citas confirmadas y pendientes para este día
              </p>
            </div>
            {metricas.citasHoy > 0 && (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400">
                {metricas.citasHoy} citas
              </span>
            )}
          </div>

          {metricas.citasHoy === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400 dark:text-slate-500">
              <Inbox size={28} />
              <p className="text-xs font-semibold">
                No tenés citas agendadas para hoy.
              </p>
              <p className="text-[11px]">
                Las reservas de tus clientes aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {turnos
                .filter(
                  (t) => t.fecha === HOY_ISO && ACTIVOS.has(t.estado || ""),
                )
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Clock size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                        {t.clientName} · {t.serviceName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {t.timeStart}–{t.timeEnd} ·{" "}
                        {t.profesionalNombre || "Sin asignar"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {t.estado}
                    </span>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={() => onNavigate("calendar")}
            className="mt-6 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Ver Calendario Maestro
            <ArrowRight size={10} />
          </button>
        </div>

        {/* Flujo de actividad en tiempo real (logs reales del store) */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl">
          <div className="flex items-center justify-between border-b border-border-subtle bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Actividad reciente
            </h3>
            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              EN VIVO
            </span>
          </div>

          <div className="max-h-[320px] flex-grow space-y-4 overflow-y-auto p-4 custom-scrollbar">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-slate-400 dark:text-slate-500">
                Sin actividad todavía. Los turnos nuevos aparecerán aquí.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-950">
                    {log.icon === "clock" && (
                      <Clock
                        size={14}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    )}
                    {log.icon === "check-circle" && (
                      <CheckCircle
                        size={14}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    )}
                    {log.icon === "alert-triangle" && (
                      <AlertTriangle size={14} className="text-amber-500" />
                    )}
                    {log.icon === "mail" && (
                      <Mail size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 border-l border-border-subtle pl-3 dark:border-slate-800">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {log.timeSpan}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {log.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {log.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
