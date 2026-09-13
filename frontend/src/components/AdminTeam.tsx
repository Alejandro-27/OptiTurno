import React, { useState, useRef } from "react";
import {
  UserPlus,
  Users,
  X,
  ShieldAlert,
  Mail,
  Phone,
  Briefcase,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  crearProfesional,
  editarProfesional,
  eliminarProfesional,
  useStore,
} from "../store";
import type { Profesional } from "../types";

export default function AdminTeam() {
  const profesionales = useStore((s) => s.profesionales);
  const sucursalId = useStore((s) => s.sucursalId);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [operationError, setOperationError] = useState<string | null>(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Profesional | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [pendingDelete, setPendingDelete] = useState<Profesional | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddDrawer = () => {
    setEditingProf(null);
    setName("");
    setEmail("");
    setPhone("");
    setSpecialty("");
    setOperationError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (prof: Profesional) => {
    setEditingProf(prof);
    setName(prof.nombre);
    setEmail(prof.email || "");
    setPhone("");
    setSpecialty(prof.especialidad || "");
    setOperationError(null);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setOperationError(null);
    setSaving(true);
    try {
      if (editingProf) {
        await editarProfesional(editingProf.id, {
          nombre: name.trim(),
          especialidad: specialty.trim() || undefined,
          telefono: phone.trim() || undefined,
        });
      } else {
        await crearProfesional({
          nombre: name.trim(),
          email: email.trim(),
          especialidad: specialty.trim() || undefined,
          telefono: phone.trim() || undefined,
        });
      }
      setIsDrawerOpen(false);
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el profesional.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setOperationError(null);
    try {
      await eliminarProfesional(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el profesional.",
      );
    } finally {
      setDeleting(false);
    }
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
        {operationError && (
          <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <ShieldAlert size={14} />
            {operationError}
          </div>
        )}

        {!operationError && sucursalId && profesionales.length === 0 && (
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
                {sucursalId
                  ? `${profesionales.length} profesional(es) activos en tu sucursal`
                  : "Sin sucursal activa asignada"}
              </p>
            </div>
          </div>
          <button
            onClick={openAddDrawer}
            disabled={!sucursalId}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-semibold text-xs transition-all shadow-md shadow-indigo-600/15 active:scale-95"
          >
            <UserPlus size={14} />
            Agregar Profesional
          </button>
        </div>

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
      </div>

      {/* Modal centrado: crear / editar profesional */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDrawerOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl rounded-2xl animate-scale-up flex flex-col">
            <div className="p-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <UserPlus
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingProf ? "Editar Profesional" : "Agregar Profesional"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Andrés Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                    <Mail
                      size={10}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    {editingProf
                      ? "Correo electrónico (no editable)"
                      : "Correo electrónico (crea su cuenta de acceso)"}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingProf}
                    placeholder="carlos@barberia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                    <Phone
                      size={10}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    Teléfono / WhatsApp (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 310 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                    <Briefcase
                      size={10}
                      className="text-amber-600 dark:text-amber-400"
                    />
                    Especialidad (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Barbería y Estilismo"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </form>
            </div>

            <div className="mt-auto bg-slate-50 dark:bg-slate-950/60 p-4 border-t border-border-subtle dark:border-slate-800 flex flex-col gap-3 rounded-b-2xl">
              {operationError && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  <ShieldAlert size={14} />
                  {operationError}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => formRef.current?.requestSubmit()}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15"
                >
                  {saving
                    ? "Guardando..."
                    : editingProf
                      ? "Guardar"
                      : "Registrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingDelete(null);
          }}
        >
          <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Eliminar profesional
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Se eliminará a{" "}
              <span className="font-bold">{pendingDelete.nombre}</span> de la
              sucursal. Sus turnos y horarios asignados también se borrarán.
            </p>
            {operationError && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <ShieldAlert size={14} />
                {operationError}
              </div>
            )}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-rose-600/15"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
