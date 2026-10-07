import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { repositorios } from "../data/index";
import type { NegocioAdminDTO, SucursalAdminDTO } from "../api/dto";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";
import AdminTableSkeleton from "./skeletons/AdminTableSkeleton";
import AdminNegocioExpandido from "./AdminNegocioExpandido";
import AdminNegocioForm from "./AdminNegocioForm";
import AdminNegocioEliminar from "./AdminNegocioEliminar";
import AdminSucursalForm from "./AdminSucursalForm";
import AdminSucursalEliminar from "./AdminSucursalEliminar";

interface UsuarioNegocio {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function AdminNegocios() {
  const { mostrarToast } = useToast();

  const [negocios, setNegocios] = useState<NegocioAdminDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [usuariosNegocio, setUsuariosNegocio] = useState<
    Record<string, UsuarioNegocio[]>
  >({});
  const [cargandoEquipo, setCargandoEquipo] = useState(false);

  // Estados de modales
  const [negocioForm, setNegocioForm] = useState<{
    abierto: boolean;
    negocio: NegocioAdminDTO | null;
  }>({ abierto: false, negocio: null });
  const [negocioEliminar, setNegocioEliminar] =
    useState<NegocioAdminDTO | null>(null);
  const [sucursalForm, setSucursalForm] = useState<{
    abierto: boolean;
    negocioId: string | null;
    negocioNombre: string | null;
    sucursal: SucursalAdminDTO | null;
  }>({ abierto: false, negocioId: null, negocioNombre: null, sucursal: null });
  const [sucursalEliminar, setSucursalEliminar] =
    useState<SucursalAdminDTO | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      const data = await repositorios.negocios.listarNegocios();
      setNegocios(data);
      setErrorText(null);
    } catch (err) {
      if (esErrorInline(err)) {
        setErrorText(
          mensajeDeError(err, "No se pudieron cargar los negocios."),
        );
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const cargarEquipo = async (negocioId: string) => {
    if (usuariosNegocio[negocioId]) return;
    setCargandoEquipo(true);
    try {
      const data = await repositorios.negocios.listarUsuariosNegocio(negocioId);
      setUsuariosNegocio((prev) => ({ ...prev, [negocioId]: data }));
    } catch (err) {
      if (esErrorInline(err)) {
        mostrarToast(
          mensajeDeError(err, "No se pudo cargar el equipo."),
          "error",
        );
      }
    } finally {
      setCargandoEquipo(false);
    }
  };

  const handleToggleExpandir = (negocioId: string) => {
    if (expandido === negocioId) {
      setExpandido(null);
    } else {
      setExpandido(negocioId);
      cargarEquipo(negocioId);
    }
  };

  const filtered = negocios.filter((n) => {
    const q = searchQuery.toLowerCase();
    const sucursalCoincide = n.sucursales.some(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        (s.direccion || "").toLowerCase().includes(q),
    );
    return n.nombre.toLowerCase().includes(q) || sucursalCoincide;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {errorText && (
        <div
          className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
          role="alert"
        >
          {errorText}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/40 border border-border-subtle dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Negocios de la plataforma
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {negocios.length} negocio(s). Crea, edita y desactiva negocios y
              sucursales.
            </p>
          </div>
        </div>
        <button
          onClick={() => setNegocioForm({ abierto: true, negocio: null })}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-semibold text-xs transition-all shadow-md shadow-indigo-600/15 active:scale-95"
        >
          <Plus size={14} />
          Crear negocio
        </button>
      </div>

      {cargando ? (
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
                placeholder="Buscar por negocio o sucursal..."
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
                  <th className="p-4 w-1/3">Negocio</th>
                  <th className="p-4">Sucursales</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 w-[140px] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {filtered.map((n) => (
                  <React.Fragment key={n.id}>
                    <tr
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/10 group transition-colors ${
                        expandido === n.id
                          ? "bg-indigo-50/50 dark:bg-indigo-500/10"
                          : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleExpandir(n.id)}
                            aria-expanded={expandido === n.id}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                            title={
                              expandido === n.id
                                ? "Ocultar sucursales"
                                : "Ver sucursales"
                            }
                          >
                            {expandido === n.id ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {n.nombre
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {n.nombre}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              /{n.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-border-subtle dark:border-slate-700">
                          {n.sucursales.length} sucursal(es)
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            n.activo
                              ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10"
                          }`}
                        >
                          {n.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            setNegocioForm({ abierto: true, negocio: n })
                          }
                          title="Editar negocio"
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setNegocioEliminar(n)}
                          title="Desactivar negocio"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>

                    {expandido === n.id && (
                      <AdminNegocioExpandido
                        negocio={n}
                        usuarios={usuariosNegocio[n.id] || []}
                        cargandoEquipo={cargandoEquipo}
                        onNuevaSucursal={() =>
                          setSucursalForm({
                            abierto: true,
                            negocioId: n.id,
                            negocioNombre: n.nombre,
                            sucursal: null,
                          })
                        }
                        onEditarSucursal={(s) =>
                          setSucursalForm({
                            abierto: true,
                            negocioId: n.id,
                            negocioNombre: n.nombre,
                            sucursal: s,
                          })
                        }
                        onEliminarSucursal={(s) => setSucursalEliminar(s)}
                      />
                    )}
                  </React.Fragment>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-xs text-slate-500"
                    >
                      No se encontraron negocios que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <AdminNegocioForm
        abierto={negocioForm.abierto}
        negocio={negocioForm.negocio}
        onCerrar={() => setNegocioForm({ abierto: false, negocio: null })}
        onGuardado={recargar}
      />
      <AdminNegocioEliminar
        negocio={negocioEliminar}
        onCerrar={() => setNegocioEliminar(null)}
        onEliminado={recargar}
      />
      <AdminSucursalForm
        abierto={sucursalForm.abierto}
        negocioId={sucursalForm.negocioId}
        negocioNombre={sucursalForm.negocioNombre}
        sucursal={sucursalForm.sucursal}
        onCerrar={() =>
          setSucursalForm({
            abierto: false,
            negocioId: null,
            negocioNombre: null,
            sucursal: null,
          })
        }
        onGuardado={recargar}
      />
      <AdminSucursalEliminar
        sucursal={sucursalEliminar}
        onCerrar={() => setSucursalEliminar(null)}
        onEliminado={recargar}
      />
    </div>
  );
}
