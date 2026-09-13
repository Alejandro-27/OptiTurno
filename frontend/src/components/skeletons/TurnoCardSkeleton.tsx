import Skeleton from "../Skeleton";

/** Esqueleto de una tarjeta de turno (Mis Turnos). */
export default function TurnoCardSkeleton() {
  return (
    <div aria-hidden className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-slate-200/70 dark:bg-slate-800/60">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  );
}
