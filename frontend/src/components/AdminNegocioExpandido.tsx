import React from "react";
import { MapPin, Plus, Pencil, Trash2, Users, Phone } from "lucide-react";
import type { NegocioAdminDTO, SucursalAdminDTO } from "../api/dto";

interface UsuarioNegocio {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface Props {
  negocio: NegocioAdminDTO;
  usuarios: UsuarioNegocio[];
  cargandoEquipo: boolean;
  onNuevaSucursal: () => void;
  onEditarSucursal: (sucursal: SucursalAdminDTO) => void;
  onEliminarSucursal: (sucursal: SucursalAdminDTO) => void;
}

const ROL_LABELS: Record<string, string> = {
  cliente: "Cliente",
  admin_negocio: "Admin",
  superadmin: "Superadmin",
  empleado: "Empleado",
};

// Fila expandida de un negocio: todas sus sucursales en filas separadas
// (con acciones de edición/eliminación) y el equipo del negocio integrado.
export default function AdminNegocioExpandido({
  negocio,
  usuarios,
  cargandoEquipo,
  onNuevaSucursal,
  onEditarSucursal,
  onEliminarSucursal,
}: Props) {
  return (
    <tr>
      <td colSpan={4} className="p-0">
        <div className="bg-indigo-50/30 dark:bg-indigo-500/5 border-t border-indigo-200 dark:border-indigo-800 px-4 sm:px-6 py-5 animate-fade-in space-y-6">
          {/* Sucursales */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <MapPin size={14} />
                Sucursales de {negocio.nombre}
              </h4>
              <button
                onClick={onNuevaSucursal}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 font-semibold text-[10px] transition-all shadow-sm active:scale-95"
              >
                <Plus size={12} />
                Nueva sucursal
              </button>
            </div>

            {negocio.sucursales.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                Este negocio aún no tiene sucursales.
              </p>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Sucursal</th>
                      <th className="p-3 hidden md:table-cell">Dirección</th>
                      <th className="p-3 hidden lg:table-cell">Teléfono</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/70">
                    {negocio.sucursales.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                          {s.nombre}
                        </td>
                        <td className="p-3 hidden md:table-cell text-slate-500 dark:text-slate-400">
                          {s.direccion || "—"}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Phone size={10} />
                            {s.telefono || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.activo
                                ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                : "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10"
                            }`}
                          >
                            {s.activo ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onEditarSucursal(s)}
                            title="Editar sucursal"
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => onEliminarSucursal(s)}
                            title="Desactivar sucursal"
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Equipo integrado */}
          <section>
            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-3">
              <Users size={14} />
              Equipo de {negocio.nombre}
            </h4>
            {cargandoEquipo ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                Cargando equipo...
              </p>
            ) : usuarios.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                Sin miembros asignados. El admin_negocio debe completar el
                onboarding.
              </p>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 w-1/3">Nombre</th>
                      <th className="p-3 hidden md:table-cell">Correo</th>
                      <th className="p-3 text-center">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/70">
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-white/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                          {u.nombre}
                        </td>
                        <td className="p-3 hidden md:table-cell text-slate-500 dark:text-slate-400 font-mono">
                          {u.email}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-border-subtle dark:border-slate-700">
                            {ROL_LABELS[u.rol] || u.rol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </td>
    </tr>
  );
}
