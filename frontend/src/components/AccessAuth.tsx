import React, { useState } from "react";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  UserPlus,
  Store,
  UserCircle2,
  LogIn,
} from "lucide-react";
import { login, registrar } from "../store";
import type { SesionDTO } from "../api/dto";
import type { Rol } from "../types/enums";

export type TipoCuenta = "cliente" | "comercio";

interface AccessAuthProps {
  tipoInicial?: TipoCuenta;
  modoInicial?: "login" | "registro";
  onAutenticado: (sesion: SesionDTO) => void;
}

const ROL_POR_TIPO: Record<TipoCuenta, Rol> = {
  cliente: "cliente",
  comercio: "admin_negocio",
};

const inputClase = "input";

export default function AccessAuth({
  tipoInicial = "cliente",
  modoInicial = "registro",
  onAutenticado,
}: AccessAuthProps) {
  const [modo, setModo] = useState<"login" | "registro">(modoInicial);
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>(tipoInicial);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const cambiarModo = (nuevoModo: "login" | "registro") => {
    setModo(nuevoModo);
    setErrorText(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
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
              rol: ROL_POR_TIPO[tipoCuenta],
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
              : "Te redirigiremos a tu vista según el tipo de cuenta."}
          </p>
        </div>

        {errorText && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-600 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0" />
            <p className="font-semibold leading-snug">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {modo === "registro" && (
            <>
              <div className="space-y-1.5">
                <label className="label-overline block">Tipo de cuenta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoCuenta("cliente")}
                    aria-pressed={tipoCuenta === "cliente"}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all ${
                      tipoCuenta === "cliente"
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-600/10"
                        : "border-border-subtle hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <UserCircle2
                      size={16}
                      className={
                        tipoCuenta === "cliente"
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400"
                      }
                    />
                    <span>
                      <span
                        className={`block text-[11px] font-bold ${
                          tipoCuenta === "cliente"
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Cliente
                      </span>
                      <span className="block text-[9px] text-slate-500 dark:text-slate-500">
                        Reservar citas
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoCuenta("comercio")}
                    aria-pressed={tipoCuenta === "comercio"}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all ${
                      tipoCuenta === "comercio"
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-600/10"
                        : "border-border-subtle hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <Store
                      size={16}
                      className={
                        tipoCuenta === "comercio"
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400"
                      }
                    />
                    <span>
                      <span
                        className={`block text-[11px] font-bold ${
                          tipoCuenta === "comercio"
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Comercio
                      </span>
                      <span className="block text-[9px] text-slate-500 dark:text-slate-500">
                        Gestionar turnos
                      </span>
                    </span>
                  </button>
                </div>
              </div>

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
                    className={inputClase}
                    placeholder="Tu nombre o el de tu comercio"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-overline block">
                  Teléfono (opcional)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
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
            </>
          )}

          <div className="space-y-1.5">
            <label className="label-overline block">Correo Electrónico</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Mail size={13} />
              </span>
              <input
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
            <label className="label-overline block">Contraseña</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Lock size={13} />
              </span>
              <input
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
                : `Crear Cuenta ${tipoCuenta === "cliente" ? "Cliente" : "Comercio"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
