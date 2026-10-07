import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { eliminarProfesional } from "../store";
import type { Profesional } from "../types";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";

interface Props {
  profesional: Profesional | null;
  onCerrar: () => void;
}

// Confirmación de borrado de un profesional de la sucursal activa.
export default function AdminTeamEliminar({ profesional, onCerrar }: Props) {
  const { mostrarToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profesional) {
      setDeleting(false);
      setError(null);
    }
  }, [profesional]);

  if (!profesional) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await eliminarProfesional(profesional.id);
      mostrarToast("Profesional eliminado correctamente.", "exito");
      onCerrar();
    } catch (err) {
      if (esErrorInline(err)) {
        setError(mensajeDeError(err, "No se pudo eliminar el profesional."));
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
              Eliminar profesional
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Se eliminará a <span className="font-bold">{profesional.nombre}</span>{" "}
          de la sucursal. Sus turnos y horarios asignados también se borrarán.
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
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
