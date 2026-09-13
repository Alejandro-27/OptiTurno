import type { ReactNode } from "react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

interface Props {
  icono: ComponentType<LucideProps>;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

/** Estado vacío minimalista (design.md §3): icono, título, copy y acción. */
export default function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface text-slate-400 shadow-sm dark:text-slate-500">
        <Icono size={30} strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-slate-800 dark:text-slate-100">
          {titulo}
        </p>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {descripcion}
        </p>
      </div>
      {accion && <div className="pt-1">{accion}</div>}
    </div>
  );
}
