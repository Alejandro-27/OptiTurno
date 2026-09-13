import React from "react";
import Breadcrumbs from "./Breadcrumbs";

interface Props {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

/** Encabezado estándar de una vista de la PWA de cliente con breadcrumbs. */
export default function PaginaCliente({ titulo, subtitulo, children }: Props) {
  return (
    <div className="space-y-5">
      <Breadcrumbs />
      <div className="mb-5 space-y-1">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 md:text-xl">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitulo}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
