import React, { useState } from "react";
import {
  UserPlus,
  Users,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../store";
import type { Profesional } from "../types";
import AdminTableSkeleton from "./skeletons/AdminTableSkeleton";
import AdminTeamForm from "./AdminTeamForm";
import AdminTeamEliminar from "./AdminTeamEliminar";

export default function AdminTeam() {
  const profesionales = useStore((s) => s.profesionales);
  const sucursalActivaId = useStore((s) => s.sucursalActivaId);
  const inicializado = useStore((s) => s.inicializado);

  const [searchQuery, setSearchQuery] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [editingProf, setEditingProf] = useState<Profesional | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Profesional | null>(null);

  const openAddDrawer = () => {
    setEditingProf(null);
    setFormAbierto(true);
  };

  const openEditDrawer = (prof: Profesional) => {
    setEditingProf(prof);
    setFormAbierto(true);
  };

  const filtered = profesionales.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.especialidad || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 flex h-full overflow-hidden relative transition-colors duration-200">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {sucursalActivaId && profesionales.length === 0 && (
          <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />
            Aún no hay profesionales. Agrega el primero para habilitar reservas.
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/40 border border-border-subtle dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Equipo de profesionales
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {sucursalActivaId
                  ? `${profesionales.length} profesional(es) activos en tu sucursal`
                  : "Sin sucursal activa asignada"}
              </p>
            </div>
          </div>
          <button
            onClick={openAddDrawer}
            disabled={!sucursalActivaId}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-semibold text-xs transition-all shadow-md shadow-indigo-600/15 active:scale-95"
          >
            <UserPlus size={14} />
            Agregar Profesional
          </button>
        </div>

        {!inicializado ? (
          <AdminTableSkeleton columnas={4} />
        ) : (
          <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="relative max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, especialidad o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-border-subtle dark:border-slate-800/80">
                    <th className="p-4 w-1/3">Profesional</th>
                    <th className="p-4 hidden md:table-cell">Especialidad</th>
                    <th className="p-4 hidden lg:table-cell">Email</th>
                    <th className="p-4 w-[120px] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/10 group transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {p.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {p.nombre}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium md:hidden">
                              {p.especialidad}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-[11px] bg-slate-100 dark:bg-slate-900 border border-border-subtle dark:border-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                          {p.especialidad}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs font-mono text-slate-500 dark:text-slate-400">
                        {p.email || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() => openEditDrawer(p)}
                            title="Editar"
                            className="p-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setPendingDelete(p)}
                            title="Eliminar"
                            className="p-1 px-1.5 rounded hover:bg-rose-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-xs text-slate-500"
                      >
                        {profesionales.length === 0
                          ? "Aún no hay profesionales registrados para esta sucursal."
                          : "No se encontraron profesionales que coincidan con los filtros."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AdminTeamForm
        abierto={formAbierto}
        profesional={editingProf}
        onCerrar={() => setFormAbierto(false)}
      />
      <AdminTeamEliminar
        profesional={pendingDelete}
        onCerrar={() => setPendingDelete(null)}
      />
    </div>
  );
}
