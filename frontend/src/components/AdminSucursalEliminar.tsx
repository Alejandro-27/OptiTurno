import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { eliminarSucursal } from "../api/negocios.api";
import type { SucursalAdminDTO } from "../api/dto";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";

interface Props {
  sucursal: SucursalAdminDTO | null;
  onCerrar: () => void;
  onEliminado: () => void;
}

// Confirmación de borrado (soft delete) de una sucursal.
export default function AdminSucursalEliminar({
  sucursal,
  onCerrar,
  onEliminado,
}: Props) {
  const { mostrarToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sucursal) {
      setDeleting(false);
      setError(null);
    }
  }, [sucursal]);

  if (!sucursal) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await eliminarSucursal(sucursal.id);
      mostrarToast("Sucursal desactivada correctamente.", "exito");
      onEliminado();
      onCerrar();
    } catch (err) {
      if (esErrorInline(err)) {
        setError(mensajeDeError(err, "No se pudo eliminar la sucursal."));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-scale-up">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Desactivar sucursal
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Se desactivará <span className="font-bold">{sucursal.nombre}</span>.
          No aparecerá en catálogos ni aceptará reservas, pero se conserva su
          historial.
        </p>
        {error && (
          <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <ShieldAlert size={14} />
            {error}
          </div>
        )}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onCerrar}
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
            {deleting ? "Desactivando..." : "Desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}
