import React, { useState } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  leerConsentimiento,
  guardarConsentimiento,
} from "../utils/consentimiento";
import { activarAnalitica } from "../utils/analytics";

// Aviso de cookies (RGPD). Solo aparece si el usuario no eligió todavía.
// 'Aceptar' habilita GA4 en la misma sesión; 'Rechazar' no (initAnalytics
// consulta el consentimiento antes de cargar el snippet).
export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !leerConsentimiento());

  const elegir = (valor: "aceptadas" | "rechazadas") => {
    guardarConsentimiento(valor);
    setVisible(false);
    if (valor === "aceptadas") activarAnalitica();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl animate-scale-up rounded-2xl border border-border-subtle bg-white p-4 shadow-2xl dark:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Cookie size={17} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
            Usamos cookies técnicas (esenciales) y, solo si aceptas, cookies de
            análisis para mejorar la plataforma. Consulta nuestra{" "}
            <Link
              to="/cookies"
              className="font-semibold text-indigo-600 underline dark:text-indigo-400"
            >
              Política de Cookies
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => elegir("aceptadas")}
              className="btn btn-primary px-4 py-2 text-xs"
            >
              Aceptar todas
            </button>
            <button
              onClick={() => elegir("rechazadas")}
              className="btn btn-secondary px-4 py-2 text-xs"
            >
              Rechazar
            </button>
          </div>
        </div>
        <button
          onClick={() => elegir("rechazadas")}
          className="ml-auto p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          aria-label="Cerrar y rechazar cookies"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
