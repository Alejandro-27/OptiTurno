import Skeleton from "../Skeleton";

interface Props {
  filas?: number;
  columnas?: number;
}

/** Esqueleto de tabla del panel admin (Catálogo/Equipo/Usuarios). */
export default function AdminTableSkeleton({ filas = 5, columnas = 4 }: Props) {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm dark:shadow-xl"
    >
      <div className="border-b border-border-subtle p-4">
        <Skeleton className="h-8 w-full max-w-md rounded-lg" />
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 border-b border-border-subtle bg-slate-50 px-4 py-3 dark:bg-slate-950/80">
          {Array.from({ length: columnas }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: filas }).map((_, fila) => (
          <div
            key={fila}
            className="flex items-center gap-4 border-b border-border-subtle/60 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            {Array.from({ length: columnas - 1 }).map((_, col) => (
              <Skeleton key={col} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
