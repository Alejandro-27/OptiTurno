import React, { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  X,
  ShieldAlert,
  Mail,
  Phone,
  Briefcase,
  Lock,
} from "lucide-react";
import { crearProfesional, editarProfesional } from "../store";
import type { Profesional } from "../types";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";

interface Props {
  abierto: boolean;
  profesional: Profesional | null;
  onCerrar: () => void;
}

const ROLES_ALTA = [
  { valor: "empleado", etiqueta: "Profesional (empleado)" },
  { valor: "admin_negocio", etiqueta: "Administrador de sede" },
] as const;

const INPUT_CLS =
  "w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors";

function Campo({
  label,
  icono,
  children,
}: {
  label: string;
  icono?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
        {icono}
        {label}
      </label>
      {children}
    </div>
  );
}

// Modal de alta/edición de un profesional. En alta crea la cuenta de acceso
// (email + contraseña obligatoria) y permite elegir el rol; en edición solo
// datos del perfil (el backend no admite cambiar contraseña/rol aquí).
export default function AdminTeamForm({
  abierto,
  profesional,
  onCerrar,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { mostrarToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"empleado" | "admin_negocio">("empleado");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    setSaving(false);
    setError(null);
    setPassword("");
    setRol("empleado");
    if (profesional) {
      setName(profesional.nombre);
      setEmail(profesional.email || "");
      setPhone("");
      setSpecialty(profesional.especialidad || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setSpecialty("");
    }
  }, [abierto, profesional]);

  if (!abierto) return null;

  const esEdicion = !!profesional;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError(null);
    setSaving(true);
    try {
      if (profesional) {
        await editarProfesional(profesional.id, {
          nombre: name.trim(),
          especialidad: specialty.trim() || undefined,
          telefono: phone.trim() || undefined,
        });
        mostrarToast("Profesional actualizado correctamente.", "exito");
      } else {
        await crearProfesional({
          nombre: name.trim(),
          email: email.trim(),
          especialidad: specialty.trim() || undefined,
          telefono: phone.trim() || undefined,
          password,
          rol,
        });
        mostrarToast("Profesional registrado correctamente.", "exito");
      }
      onCerrar();
    } catch (err) {
      if (esErrorInline(err)) {
        setError(mensajeDeError(err, "No se pudo guardar el profesional."));
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
              <UserPlus
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {esEdicion ? "Editar Profesional" : "Agregar Profesional"}
              </h3>
            </div>
            <button
              onClick={onCerrar}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <Campo label="Nombre completo">
              <input
                type="text"
                required
                placeholder="Ej. Carlos Andrés Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            <Campo
              label={
                esEdicion
                  ? "Correo electrónico (no editable)"
                  : "Correo electrónico (crea su cuenta de acceso)"
              }
              icono={
                <Mail
                  size={10}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              }
            >
              <input
                type="email"
                required
                disabled={esEdicion}
                placeholder="carlos@barberia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${INPUT_CLS} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </Campo>

            {!esEdicion && (
              <>
                <Campo
                  label="Contraseña de acceso (mínimo 6 caracteres)"
                  icono={
                    <Lock
                      size={10}
                      className="text-rose-600 dark:text-rose-400"
                    />
                  }
                >
                  <input
                    type="text"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Contraseña con la que entrará"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={INPUT_CLS}
                  />
                </Campo>

                <Campo
                  label="Rol de la cuenta"
                  icono={
                    <ShieldAlert
                      size={10}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  }
                >
                  <select
                    value={rol}
                    onChange={(e) =>
                      setRol(e.target.value as "empleado" | "admin_negocio")
                    }
                    className={INPUT_CLS}
                  >
                    {ROLES_ALTA.map((r) => (
                      <option key={r.valor} value={r.valor}>
                        {r.etiqueta}
                      </option>
                    ))}
                  </select>
                </Campo>
              </>
            )}

            <Campo
              label="Teléfono / WhatsApp (opcional)"
              icono={
                <Phone
                  size={10}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              }
            >
              <input
                type="text"
                placeholder="Ej. 310 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            <Campo
              label="Especialidad (opcional)"
              icono={
                <Briefcase
                  size={10}
                  className="text-amber-600 dark:text-amber-400"
                />
              }
            >
              <input
                type="text"
                placeholder="Ej. Barbería y Estilismo"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>
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
              {saving ? "Guardando..." : esEdicion ? "Guardar" : "Registrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
