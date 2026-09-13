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

  return (
    <div className="max-w-md space-y-4">
      {exito && (
        <div className="animate-fade-in flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <p className="font-semibold">Perfil actualizado correctamente.</p>
        </div>
      )}

      {errorText && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="flex-shrink-0" />
          <p className="font-semibold leading-snug">{errorText}</p>
        </div>
      )}

      <form onSubmit={guardar} className="card space-y-4 p-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="label-overline block">Nombre Completo</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <User size={13} />
            </span>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label-overline block">Número WhatsApp</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <Phone size={13} />
            </span>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="input"
              placeholder="+57 300 000 0000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label-overline block">Correo Electrónico</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <Mail size={13} />
            </span>
            <input
              type="email"
              disabled
              value={sesion?.usuario.email || ""}
              className="input cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-2.5"
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
