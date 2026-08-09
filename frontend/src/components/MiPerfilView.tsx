import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { actualizarPerfil, useStore } from "../store";

export default function MiPerfilView() {
  const sesion = useStore((s) => s.sesion);
  const [nombre, setNombre] = useState(sesion?.usuario.nombre || "");
  const [telefono, setTelefono] = useState(sesion?.usuario.telefono || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setExito(false);
    setIsLoading(true);
    try {
      await actualizarPerfil({
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
      });
      setExito(true);
      setTimeout(() => setExito(false), 3500);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "No se pudo guardar el perfil.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClase =
    "w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="max-w-md space-y-4">
      {exito && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px] animate-fade-in">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <p className="font-semibold">Perfil actualizado correctamente.</p>
        </div>
      )}

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-[11px]">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p className="font-semibold leading-snug">{errorText}</p>
        </div>
      )}

      <form
        onSubmit={guardar}
        className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Nombre Completo
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
              <User size={13} />
            </span>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClase}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Número WhatsApp
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
              <Phone size={13} />
            </span>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClase}
              placeholder="+57 300 000 0000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
              <Mail size={13} />
            </span>
            <input
              type="email"
              disabled
              value={sesion?.usuario.email || ""}
              className={
                inputClase +
                " opacity-60 cursor-not-allowed"
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}