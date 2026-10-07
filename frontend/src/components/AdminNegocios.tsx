import React, { useState, useEffect } from "react";
import { Building2, Plus, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { obtenerSucursales, listarUsuariosNegocio } from "../api/negocios.api";
import type { SucursalDTO } from "../api/dto";
import { useToast } from "../contexts/toast";
import { esErrorInline, mensajeDeError } from "../api/dto";
import AdminTableSkeleton from "./skeletons/AdminTableSkeleton";

type NegocioConSucursales = SucursalDTO & {
  negocio_id: string;
  slug: string;
};

export default function AdminNegocios() {
  const { mostrarToast } = useToast();
  const navigate = useNavigate();

  const [negocios, setNegocios] = useState<NegocioConSucursales[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gestionandoNegocio, setGestionandoNegocio] = useState<string | null>(
    null,
  );
  const [usuariosNegocio, setUsuariosNegocio] = useState<
    {
      id: string;
      nombre: string;
      email: string;
      rol: string;
    }[]
  >([]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerSucursales()
      .then((data) => {
        if (activo) {
          // Agrupar sucursales por negocio y tomar slug del negocio
          const mapa = new Map<string, NegocioConSucursales>();
          data.forEach((s) => {
            const key = s.negocios?.nombre || s.negocio_id;
            if (!mapa.has(key)) {
              mapa.set(key, {
                ...s,
                negocio_id: s.negocio_id,
                slug: s.negocio_id, // usamos id como slug para el link
              });
            }
          });
          setNegocios(Array.from(mapa.values()));
        }
      })
      .catch((err) => {
        if (activo && esErrorInline(err)) {
          setErrorText(
            mensajeDeError(err, "No se pudieron cargar los negocios."),
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleGestionarEquipo = async (negocioId: string) => {
    if (gestionandoNegocio === negocioId) {
      setGestionandoNegocio(null);
      setUsuariosNegocio([]);
      return;
    }
    try {
      setGestionandoNegocio(negocioId);
      const data = await listarUsuariosNegocio(negocioId);
      setUsuariosNegocio(data);
    } catch (err) {
      if (esErrorInline(err)) {
        mostrarToast(
          mensajeDeError(err, "No se pudo cargar el equipo."),
          "error",
        );
      }
    }
  };

  const filtered = negocios.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      n.negocios?.nombre.toLowerCase().includes(q) ||
      n.nombre.toLowerCase().includes(q)
    );
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
              {negocios.length} negocio(s). Gestiona el equipo de cada uno.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/onboarding")}
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
                placeholder="Buscar por nombre de negocio o sucursal..."
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
                  <th className="p-4 hidden md:table-cell">
                    Sucursal principal
                  </th>
                  <th className="p-4 text-center">Equipo</th>
                  <th className="p-4 w-[140px] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {filtered.map((n) => (
                  <React.Fragment key={n.negocio_id}>
                    <tr
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/10 group transition-colors ${
                        gestionandoNegocio === n.negocio_id
                          ? "bg-indigo-50/50 dark:bg-indigo-500/10"
                          : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {n.negocios?.nombre
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {n.negocios?.nombre || "Sin nombre"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono md:hidden">
                              {n.negocio_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <MapPin size={12} />
                          {n.nombre}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-border-subtle dark:border-slate-700">
                          {usuariosNegocio.length > 0 &&
                          gestionandoNegocio === n.negocio_id
                            ? `${usuariosNegocio.length} miembro(s)`
                            : "—"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleGestionarEquipo(n.negocio_id)}
                          disabled={cargando}
                          className={`p-1.5 px-2 rounded text-xs font-medium transition-colors ${
                            gestionandoNegocio === n.negocio_id
                              ? "bg-indigo-500 text-white"
                              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          }`}
                        >
                          {gestionandoNegocio === n.negocio_id
                            ? "Ocultar equipo"
                            : "Gestionar equipo"}
                        </button>
                      </td>
                    </tr>

                    {/* Fila expandida con el equipo */}
                    {gestionandoNegocio === n.negocio_id && (
                      <tr>
                        <td colSpan={4} className="p-0">
                          <div className="bg-indigo-50/30 dark:bg-indigo-500/5 border-t border-indigo-200 dark:border-indigo-800 px-6 py-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                Equipo de {n.negocios?.nombre}
                              </h4>
                              <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
                                {usuariosNegocio.length} usuario(s)
                              </span>
                            </div>
                            {usuariosNegocio.length === 0 ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                                Sin miembros asignados. El admin_negocio debe
                                completar onboarding.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700">
                                      <th className="p-3 w-1/3">Nombre</th>
                                      <th className="p-3 hidden md:table-cell">
                                        Correo
                                      </th>
                                      <th className="p-3 text-center">Rol</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {usuariosNegocio.map((u) => (
                                      <tr
                                        key={u.id}
                                        className="hover:bg-white/50 dark:hover:bg-slate-800/50"
                                      >
                                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                                          {u.nombre}
                                        </td>
                                        <td className="p-3 hidden md:table-cell text-slate-500 dark:text-slate-400 font-mono">
                                          {u.email}
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-border-subtle dark:border-slate-700">
                                            {u.rol}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
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
    </div>
  );
}
