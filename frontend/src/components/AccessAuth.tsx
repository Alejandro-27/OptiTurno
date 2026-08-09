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

export type TipoCuenta = "cliente" | "comercio";

interface AccessAuthProps {
  tipoInicial?: TipoCuenta;
  modoInicial?: "login" | "registro";
  onAutenticado: (sesion: SesionDTO) => void;
}

const ROL_POR_TIPO: Record<TipoCuenta, string> = {
  cliente: "cliente",
  comercio: "admin_negocio",
};

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

  const inputClase =
    "w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="w-full bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-left transition-colors duration-200">
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => cambiarModo("login")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            modo === "login"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <LogIn size={13} />
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => cambiarModo("registro")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            modo === "registro"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <UserPlus size={13} />
          Crear Cuenta
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {modo === "login"
              ? "Acceso a tu cuenta"
              : "Crea tu cuenta OptiTurno"}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {modo === "login"
              ? "Ingresa tus credenciales para continuar."
              : "Te redirigiremos a tu vista según el tipo de cuenta."}
          </p>
        </div>

        {errorText && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-[11px]">
            <AlertCircle size={14} className="flex-shrink-0" />
            <p className="font-semibold leading-snug">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {modo === "registro" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoCuenta("cliente")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      tipoCuenta === "cliente"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-600/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      tipoCuenta === "comercio"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-600/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                    placeholder="Tu nombre o el de tu comercio"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Teléfono (opcional)
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
            </>
          )}

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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClase}
                placeholder="ej: nombre@correo.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock size={13} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={
                  inputClase + " pr-10"
                }
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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