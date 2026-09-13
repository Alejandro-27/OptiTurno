import Skeleton from "../Skeleton";

/** Esqueleto del wizard de reserva (pasos de profesional/horario). */
export default function BookingWizardSkeleton() {
  return (
    <div aria-hidden className="card space-y-5 p-5 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 border-t border-border-subtle pt-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}
