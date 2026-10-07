import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert, X, MapPin } from "lucide-react";
import { crearSucursal, actualizarSucursal } from "../api/negocios.api";
import type { SucursalAdminDTO, CrearSucursalInputDTO } from "../api/dto";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";

interface Props {
  abierto: boolean;
  negocioId: string | null;
  negocioNombre: string | null;
  sucursal: SucursalAdminDTO | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const INPUT_CLS =
  "w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors";

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

// Alta/edición de una sucursal dentro de un negocio (solo superadmin).
export default function AdminSucursalForm({
  abierto,
  negocioId,
  negocioNombre,
  sucursal,
  onCerrar,
  onGuardado,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { mostrarToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    setSaving(false);
    setError(null);
    setActivo(true);
    if (sucursal) {
      setNombre(sucursal.nombre);
      setDireccion(sucursal.direccion || "");
      setTelefono(sucursal.telefono || "");
      setActivo(sucursal.activo);
    } else {
      setNombre("");
      setDireccion("");
      setTelefono("");
    }
  }, [abierto, sucursal]);

  if (!abierto) return null;

  const esEdicion = !!sucursal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !direccion.trim() || !telefono.trim()) return;
    setError(null);
    setSaving(true);
    try {
      if (sucursal) {
        await actualizarSucursal(sucursal.id, {
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          activo,
        });
        mostrarToast("Sucursal actualizada correctamente.", "exito");
      } else {
        const datos: CrearSucursalInputDTO = {
          negocio_id: negocioId!,
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
        };
        await crearSucursal(datos);
        mostrarToast("Sucursal creada correctamente.", "exito");
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      if (esErrorInline(err)) {
        setError(mensajeDeError(err, "No se pudo guardar la sucursal."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl rounded-2xl animate-scale-up flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {esEdicion ? "Editar Sucursal" : "Nueva Sucursal"}
              </h3>
            </div>
            <button
              onClick={onCerrar}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {negocioNombre && (
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              Negocio: <span className="font-bold">{negocioNombre}</span>
            </p>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            <Campo label="Nombre de la sucursal">
              <input
                type="text"
                required
                placeholder="Ej. Sede Central Anapoima"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            <Campo label="Dirección">
              <input
                type="text"
                required
                placeholder="Ej. Calle 4 #5-12"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            <Campo label="Teléfono">
              <input
                type="text"
                required
                placeholder="Ej. 310 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            {esEdicion && (
              <div className="flex items-center justify-between rounded-lg border border-border-subtle dark:border-slate-800 px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Sucursal activa
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Aparece en catálogos y reservas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivo((v) => !v)}
                  aria-pressed={activo}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    activo ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow translate-y-1 transition-transform ${
                      activo ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-auto bg-slate-50 dark:bg-slate-950/60 p-4 border-t border-border-subtle dark:border-slate-800 flex flex-col gap-3 rounded-b-2xl">
          {error && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCerrar}
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
              {saving ? "Guardando..." : esEdicion ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
