import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  UserPlus,
  LogIn,
} from "lucide-react";
import { login, registrar } from "../store";
import type { SesionDTO } from "../api/dto";

interface AccessAuthProps {
  modoInicial?: "login" | "registro";
  onAutenticado: (sesion: SesionDTO) => void;
}

const inputClase = "input";

export default function AccessAuth({
  modoInicial = "registro",
  onAutenticado,
}: AccessAuthProps) {
  const [modo, setModo] = useState<"login" | "registro">(modoInicial);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Honeypot anti-spam: campo oculto que los bots llenan por defecto.
  const [web, setWeb] = useState("");
  // Consentimiento RGPD (obligatorio para crear la cuenta).
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const cambiarModo = (nuevoModo: "login" | "registro") => {
    setModo(nuevoModo);
    setErrorText(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (modo === "registro" && (!aceptoTerminos || !aceptoPrivacidad)) {
      setErrorText(
        "Debes aceptar los Términos y la Política de Privacidad para continuar.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const sesion =
        modo === "login"
          ? await login(email.trim(), password)
          : await registrar({
              nombre: nombre.trim(),
              email: email.trim(),
              password,
              telefono: telefono.trim() || undefined,
              rol: "cliente",
              web,
              acepto_terminos: aceptoTerminos,
              acepto_privacidad: aceptoPrivacidad,
            });
      onAutenticado(sesion);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "Error de autenticación.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full overflow-hidden text-left shadow-xl transition-colors duration-200">
      {/* Marca */}
      <div className="flex items-center gap-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-sm font-extrabold text-white shadow-sm backdrop-blur">
          OT
        </div>
        <div className="text-left">
          <p className="font-display text-base font-semibold leading-tight text-white">
            OptiTurno
          </p>
          <p className="text-[10px] font-semibold text-white/70">
            Agenda tu servicio en segundos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle bg-slate-100 p-1.5 dark:border-slate-800/80 dark:bg-slate-950/70">
        <button
          type="button"
          onClick={() => cambiarModo("login")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
            modo === "login"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <LogIn size={13} />
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => cambiarModo("registro")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
            modo === "registro"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <UserPlus size={13} />
          Crear Cuenta
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            {modo === "login"
              ? "Acceso a tu cuenta"
              : "Crea tu cuenta OptiTurno"}
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {modo === "login"
              ? "Ingresa tus credenciales para continuar."
              : "Tu cuenta de cliente para reservar tus citas."}
          </p>
        </div>

        {errorText && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-600 dark:text-red-400"
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <p className="font-semibold leading-snug">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Honeypot anti-spam: invisibles para humanos, atractivos para bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="web">Tu sitio web (no llenes este campo)</label>
            <input
              id="web"
              type="text"
              name="web"
              tabIndex={-1}
              autoComplete="off"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
            />
          </div>

          {modo === "registro" && (
            <>
              <div className="space-y-1.5">
                <label className="label-overline block" htmlFor="fa-nombre">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <User size={13} />
                  </span>
                  <input
                    id="fa-nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClase}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-overline block" htmlFor="fa-telefono">
                  Teléfono (opcional)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Phone size={13} />
                  </span>
                  <input
                    id="fa-telefono"
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={inputClase}
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="label-overline block" htmlFor="fa-email">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Mail size={13} />
              </span>
              <input
                id="fa-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClase}
                placeholder="ej: nombre@correo.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label-overline block" htmlFor="fa-password">
              Contraseña
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Lock size={13} />
              </span>
              <input
                id="fa-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClase + " pr-10"}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {modo === "registro" && (
            <div className="space-y-2 rounded-xl border border-border-subtle bg-slate-50 p-3 dark:bg-slate-900/60">
              <label className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600"
                />
                <span>
                  Acepto los{" "}
                  <Link
                    to="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-600 underline dark:text-indigo-400"
                  >
                    Términos y Condiciones
                  </Link>
                  .
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={aceptoPrivacidad}
                  onChange={(e) => setAceptoPrivacidad(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600"
                />
                <span>
                  Autorizo el tratamiento de mis datos conforme a la{" "}
                  <Link
                    to="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-600 underline dark:text-indigo-400"
                  >
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-2.5"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : modo === "login" ? (
              <LogIn size={13} />
            ) : (
              <UserPlus size={13} />
            )}
            {isLoading
              ? "Procesando..."
              : modo === "login"
                ? "Iniciar Sesión"
                : "Crear Cuenta de Cliente"}
          </button>
        </form>
      </div>
    </div>
  );
}
