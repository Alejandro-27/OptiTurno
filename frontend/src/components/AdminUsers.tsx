import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Edit3,
  X,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";
import { cargarUsuarios, editarUsuario, useStore } from "../store";
import type { UsuarioAdminDTO } from "../api/dto";
import { ROLES_SISTEMA } from "../types/enums";
import type { Rol } from "../types/enums";

const ROLES = ROLES_SISTEMA;

const ETIQUETA_ROL: Record<Rol, string> = {
  cliente: "Cliente",
  admin_negocio: "Comercio",
  superadmin: "Super Admin",
  empleado: "Profesional",
};

const COLOR_ROL: Record<Rol, string> = {
  cliente:
    "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-border-subtle dark:border-slate-800",
  admin_negocio:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  superadmin:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  empleado:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export default function AdminUsers() {
  const usuarios = useStore((s) => s.usuarios);
  const sesion = useStore((s) => s.sesion);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<UsuarioAdminDTO | null>(null);
  const [formEmail, setFormEmail] = useState("");
  const [formRol, setFormRol] = useState<Rol>("cliente");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [okText, setOkText] = useState<string | null>(null);

  useEffect(() => {
    cargarUsuarios().catch(() =>
      setErrorText("No se pudieron cargar los usuarios."),
    );
  }, []);

  const sesionId = sesion?.usuario.id;
  const esPropio = editing?.id === sesionId;

  const filtered = usuarios.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const openEdit = (u: UsuarioAdminDTO) => {
    setEditing(u);
    setFormEmail(u.email);
    setFormRol(u.rol);
    setErrorText(null);
    setOkText(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setErrorText(null);
    setOkText(null);
    setSaving(true);
    try {
      await editarUsuario(editing.id, {
        email:
          formEmail.trim() !== editing.email ? formEmail.trim() : undefined,
        rol: esPropio ? undefined : formRol,
      });
      setOkText("Usuario actualizado correctamente.");
      setEditing(null);
    } catch (err) {
      setErrorText(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {errorText && !editing && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          <ShieldAlert size={14} />
          {errorText}
        </div>
      )}
      {okText && !editing && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 size={14} />
          {okText}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/40 border border-border-subtle dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Usuarios del sistema
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {usuarios.length} cuenta(s). Podés editar el correo (único) y el
              rol, salvo el tuyo.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
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
                <th className="p-4 w-1/3">Nombre</th>
                <th className="p-4 hidden md:table-cell">Correo</th>
                <th className="p-4 text-center">Rol</th>
                <th className="p-4 w-[120px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/10 group transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                        {u.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.nombre}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium md:hidden">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-xs font-mono text-slate-500 dark:text-slate-400">
                    {u.email}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${COLOR_ROL[u.rol] || COLOR_ROL.cliente}`}
                      >
                        <Shield size={10} />
                        {ETIQUETA_ROL[u.rol] || u.rol}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEdit(u)}
                      title="Editar usuario"
                      className="p-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    No se encontraron usuarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal centrado: editar correo / rol */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Edit3
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Editar usuario
                </h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                  <Mail
                    size={10}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Correo electrónico (único)
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                  <Shield
                    size={10}
                    className="text-amber-600 dark:text-amber-400"
                  />
                  Rol
                </label>
                <select
                  value={formRol}
                  disabled={esPropio}
                  onChange={(e) => setFormRol(e.target.value as Rol)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ETIQUETA_ROL[r]}
                    </option>
                  ))}
                </select>
                {esPropio && (
                  <p className="text-[10px] text-slate-500">
                    No podés cambiar tu propio rol.
                  </p>
                )}
              </div>

              {errorText && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  <ShieldAlert size={14} />
                  {errorText}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
