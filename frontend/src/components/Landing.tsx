import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarX,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import AccessAuth from "./AccessAuth";
import ComoFuncionaSection from "./ComoFuncionaSection";
import BeneficiosSection from "./BeneficiosSection";
import ThemeToggle from "./ThemeToggle";
import { useStore } from "../store";
import { MODO_DEMO } from "../config/env";
import type { SesionDTO } from "../api/dto";
import { trackEvent } from "../utils/analytics";

/** Landing Pública ("/") — CTA sobre el fold, prueba social y enlaces internos. */
export default function Landing() {
  const sesion = useStore((s) => s.sesion);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sesion) return;
    navigate(sesion.usuario.rol === "cliente" ? "/reservar" : "/admin", {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.usuario.id]);

  const irSegunRol = (s: SesionDTO) => {
    navigate(s.usuario.rol === "cliente" ? "/reservar" : "/admin");
  };

  const ctaRegistro = (target: string) => {
    trackEvent("cta_click", { ubicacion: target });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25">
              OT
            </div>
            <div>
              <h1 className="font-display text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50">
                OptiTurno
              </h1>
              <p className="mt-1 text-[10px] font-medium leading-none text-slate-500 dark:text-slate-400">
                {MODO_DEMO ? "Modo demostración" : "Conectado a tu comercio"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="#registro"
              onClick={() => ctaRegistro("header-ingresar")}
              className="btn btn-secondary hidden px-4 py-2 sm:inline-flex"
            >
              Ingresar
            </a>
          </div>
        </div>
      </header>

      {/* Hero — CTA principal sobre el fold */}
      <section className="px-4 pb-10 pt-12 md:px-6 md:pb-16 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="badge badge-success">
                <Sparkles size={11} />
                Agendamiento inteligente
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                Tu próximo turno,
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                  reservado en segundos
                </span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Barberías, estética, salud y más. Normalizá tu agenda con un
                solo calendario compartido y reducí las inasistencias con
                recordatorios automáticos por WhatsApp.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/reservar"
                  onClick={() => ctaRegistro("hero-reservar")}
                  className="btn btn-primary px-6 py-3"
                >
                  Reservar turno ahora
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="#registro"
                  onClick={() => ctaRegistro("hero-soy-comercio")}
                  className="btn btn-secondary px-6 py-3"
                >
                  <Store size={14} />
                  Soy comercio
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CalendarX size={13} className="text-emerald-600" />
                  Sin doble reserva
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck
                    size={13}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Agenda en tiempo real
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Recordatorios por WhatsApp
                </span>
              </div>
            </div>

            {/* Registro / Login — punto de conversión */}
            <div id="registro" className="scroll-mt-20 lg:pl-4">
              <AccessAuth onAutenticado={irSegunRol} />
            </div>
          </div>
        </div>
      </section>

      <ComoFuncionaSection />
      <BeneficiosSection />

      <footer className="border-t border-border-subtle bg-surface px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-extrabold text-white">
                OT
              </div>
              <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-50">
                OptiTurno
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              El agendamiento inteligente para comercios de servicios
              presenciales.
            </p>
          </div>

          <nav
            aria-label="Enlaces útiles"
            className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <Link
              to="/reservar"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Reservar cita
            </Link>
            <a
              href="#registro"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Crear cuenta
            </a>
            <a
              href="#registro"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Para comercios
            </a>
            {sesion?.usuario.rol === "cliente" && (
              <Link
                to="/turnos"
                className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Mis turnos
              </Link>
            )}
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-6xl border-t border-border-subtle pt-4 text-[10px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} OptiTurno — SaaS de agendamiento
          {MODO_DEMO && " · Datos de demostración."}
        </p>
      </footer>
    </div>
  );
}
