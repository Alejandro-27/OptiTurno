import React, { useState } from "react";
import {
  UserPlus,
  Users,
  X,
  ShieldAlert,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { crearProfesional, useStore } from "../store";

export default function AdminTeam() {
  const profesionales = useStore((s) => s.profesionales);
  const sucursalId = useStore((s) => s.sucursalId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSpecialty("");
    setError(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await crearProfesional({
        nombre: name.trim(),
        email: email.trim(),
        especialidad: specialty.trim() || undefined,
        telefono: phone.trim() || undefined,
      });
      setSuccess("Profesional registrado. Ya puede recibir turnos.");
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el profesional.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {success && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <Sparkles size={14} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          <ShieldAlert size={14} />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors duration-200">
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
          onClick={handleOpenForm}
          disabled={!sucursalId}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-semibold text-xs transition-all shadow-md shadow-indigo-600/15 active:scale-95"
        >
          <UserPlus size={14} />
          Agregar Profesional
        </button>
      </div>

      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                <th className="p-4">Profesional</th>
                <th className="p-4 hidden md:table-cell">Especialidad</th>
                <th className="p-4 hidden lg:table-cell">Email</th>
                <th className="p-4 text-center">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {profesionales.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/10 transition-colors"
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
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 md:hidden">
                          {p.especialidad}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[11px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                      {p.especialidad}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-xs font-mono text-slate-500 dark:text-slate-400">
                    {p.email || "—"}
                  </td>
                  <td className="p-4 text-center text-[10px] font-mono text-slate-400">
                    {p.usuarioId.slice(0, 8)}
                  </td>
                </tr>
              ))}
              {profesionales.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    Aún no hay profesionales registrados para esta sucursal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="bg-white dark:bg-[#0b1120] border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full overflow-y-auto flex flex-col shadow-2xl animate-slide-left p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="flex flex-col justify-between space-y-6 min-h-full">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <UserPlus
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Registro de Profesional
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                      <Mail size={10} className="text-indigo-600 dark:text-indigo-400" />
                      Correo electrónico (crea su cuenta de acceso)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@barberia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                      <Phone size={10} className="text-emerald-600 dark:text-emerald-400" />
                      Teléfono / WhatsApp (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 310 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                      <Briefcase size={10} className="text-amber-600 dark:text-amber-400" />
                      Especialidad (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Barbería y Estilismo"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 -mx-6 -mb-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                {error && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                    <ShieldAlert size={14} />
                    {error}
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15"
                  >
                    {saving ? "Registrando..." : "Registrar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}