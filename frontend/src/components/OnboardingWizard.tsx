import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/toast";
import { crearNegocioOnboarding } from "../api/negocios.api";
import { esErrorInline, mensajeDeError, ApiError } from "../api/dto";

const PASOS = [
  { id: "negocio", titulo: "Tu Negocio", icono: Building2 },
  { id: "sucursal", titulo: "Primera Sucursal", icono: MapPin },
  { id: "confirmar", titulo: "Confirmar", icono: CheckCircle },
] as const;

type PasoId = (typeof PASOS)[number]["id"];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [pasoActual, setPasoActual] = useState<PasoId>("negocio");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [sucursalNombre, setSucursalNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  // Auto-generar slug desde nombre
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNombre(valor);
    if (
      !slug ||
      slug.toLowerCase() === nombre.toLowerCase().replace(/\s+/g, "-")
    ) {
      setSlug(
        valor
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60),
      );
    }
  };

  const validarPaso = (): boolean => {
    if (pasoActual === "negocio") {
      if (!nombre.trim() || nombre.trim().length < 2) {
        setErrorForm("El nombre debe tener al menos 2 caracteres.");
        return false;
      }
      if (!slug.trim() || slug.trim().length < 2) {
        setErrorForm("El slug debe tener al menos 2 caracteres.");
        return false;
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        setErrorForm(
          "El slug solo puede contener letras minúsculas, números y guiones.",
        );
        return false;
      }
    }
    if (pasoActual === "sucursal") {
      if (!sucursalNombre.trim() || sucursalNombre.trim().length < 2) {
        setErrorForm("El nombre de la sucursal es obligatorio.");
        return false;
      }
      if (!direccion.trim() || direccion.trim().length < 5) {
        setErrorForm("La dirección es obligatoria (mín. 5 caracteres).");
        return false;
      }
      if (!telefono.trim() || telefono.trim().length < 6) {
        setErrorForm("El teléfono es obligatorio.");
        return false;
      }
    }
    setErrorForm(null);
    return true;
  };

  const handleSiguiente = () => {
    if (!validarPaso()) return;
    const idx = PASOS.findIndex((p) => p.id === pasoActual);
    if (idx < PASOS.length - 1) setPasoActual(PASOS[idx + 1].id);
  };

  const handleAnterior = () => {
    const idx = PASOS.findIndex((p) => p.id === pasoActual);
    if (idx > 0) setPasoActual(PASOS[idx - 1].id);
  };

  const handleEnviar = async () => {
    if (!validarPaso()) return;
    setErrorForm(null);
    setGuardando(true);
    try {
      await crearNegocioOnboarding({
        nombre: nombre.trim(),
        slug: slug.trim(),
        sucursal: {
          nombre: sucursalNombre.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
        },
      });
      setCompletado(true);
      mostrarToast("¡Negocio creado correctamente! Redirigiendo...", "exito");
      // Pequeña pausa para que se vea el estado de éxito
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      if (err instanceof ApiError && err.estado === 409) {
        setErrorForm("Ese slug ya está en uso. Elige otro.");
      } else if (esErrorInline(err)) {
        setErrorForm(mensajeDeError(err, "No se pudo crear el negocio."));
      } else {
        setErrorForm("Error de conexión. Inténtalo de nuevo.");
      }
    } finally {
      setGuardando(false);
    }
  };

  // Si ya completó, no renderizar el wizard
  if (completado) return null;

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fade-in"
      role="main"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Progress header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Configuración inicial de tu negocio
            </h2>
            {pasoActual !== "negocio" && (
              <button
                type="button"
                onClick={handleAnterior}
                disabled={guardando}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Paso anterior"
              >
                <ArrowLeft size={18} />
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-2"
            role="progressbar"
            aria-valuenow={PASOS.findIndex((p) => p.id === pasoActual) + 1}
            aria-valuemin={1}
            aria-valuemax={PASOS.length}
            aria-label="Progreso del onboarding"
          >
            {PASOS.map((paso, idx) => {
              const actualIdx = PASOS.findIndex((p) => p.id === pasoActual);
              const completado = idx < actualIdx;
              const activo = idx === actualIdx;
              return (
                <React.Fragment key={paso.id}>
                  <div className="flex items-center gap-1.5 flex-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        completado
                          ? "bg-emerald-500 text-white"
                          : activo
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {completado ? (
                        <CheckCircle size={14} />
                      ) : (
                        <paso.icono size={14} />
                      )}
                    </div>
                    <div
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        idx < actualIdx
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${
                      activo
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400"
                    }`}
                  >
                    {paso.titulo}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form content */}
        <div className="p-6 space-y-6">
          {errorForm && (
            <div
              className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
              role="alert"
            >
              <AlertCircle size={14} />
              {errorForm}
            </div>
          )}

          {/* Paso 1: Negocio */}
          {pasoActual === "negocio" && (
            <div className="space-y-4" data-paso="negocio">
              <div className="space-y-1.5">
                <label
                  htmlFor="nombre"
                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"
                >
                  <Building2
                    size={10}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Nombre del negocio
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  placeholder="Ej. Barbería El Elegante"
                  value={nombre}
                  onChange={handleNombreChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="slug"
                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"
                >
                  <Building2
                    size={10}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Slug (URL amigable)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-xs font-mono">
                    optiturno.com/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    required
                    placeholder="barberia-el-elegante"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 pl-28 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Se usará en tu URL pública. Solo minúsculas, números y
                  guiones.
                </p>
              </div>
            </div>
          )}

          {/* Paso 2: Sucursal */}
          {pasoActual === "sucursal" && (
            <div className="space-y-4" data-paso="sucursal">
              <div className="space-y-1.5">
                <label
                  htmlFor="sucursalNombre"
                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"
                >
                  <MapPin
                    size={10}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Nombre de la sucursal
                </label>
                <input
                  id="sucursalNombre"
                  type="text"
                  required
                  placeholder="Ej. Sede Central Anapoima"
                  value={sucursalNombre}
                  onChange={(e) => setSucursalNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="direccion"
                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"
                >
                  <MapPin
                    size={10}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Dirección
                </label>
                <input
                  id="direccion"
                  type="text"
                  required
                  placeholder="Ej. Calle 4 #5-12, Anapoima"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="telefono"
                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1"
                >
                  <Phone
                    size={10}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Teléfono / WhatsApp
                </label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  placeholder="Ej. 310 123 4567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Confirmar */}
          {pasoActual === "confirmar" && (
            <div className="space-y-4" data-paso="confirmar">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Resumen de tu configuración
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Negocio
                    </dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {nombre}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Slug</dt>
                    <dd className="font-semibold font-mono text-slate-900 dark:text-slate-100">
                      optiturno.com/{slug}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Sucursal
                    </dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {sucursalNombre}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Dirección
                    </dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {direccion}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Teléfono
                    </dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {telefono}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                Al confirmar, se creará tu negocio y sucursal principal. Podrás
                agregar más sucursales y configurar servicios desde el panel.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            {pasoActual !== "negocio" && (
              <button
                type="button"
                onClick={handleAnterior}
                disabled={guardando}
                className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={
                pasoActual === "confirmar" ? handleEnviar : handleSiguiente
              }
              disabled={guardando}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15"
            >
              {guardando ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  {pasoActual === "confirmar" ? "Creando..." : "Guardando..."}
                </span>
              ) : pasoActual === "confirmar" ? (
                "Confirmar y crear"
              ) : (
                "Siguiente"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
