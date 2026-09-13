import type { HTMLAttributes } from "react";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  className?: string;
}

/** Bloque placeholder con shimmer (design.md §3). Usar para estados de carga. */
export default function Skeleton({ className = "", ...rest }: Props) {
  return (
    <div
      aria-hidden
      data-testid="skeleton"
      className={`relative overflow-hidden rounded-lg bg-slate-200/70 dark:bg-slate-800/60 ${className}`}
      {...rest}
    >
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/90 to-transparent dark:via-slate-700/50" />
    </div>
  );
}
