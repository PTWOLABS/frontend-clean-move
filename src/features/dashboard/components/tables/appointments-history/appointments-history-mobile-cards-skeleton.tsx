import { Skeleton } from "@/components/ui/skeleton";

const appointmentsHistoryMobileSkeletonCards = ["first", "second", "third", "fourth", "fifth"];

export function AppointmentsHistoryMobileCardsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando histórico de agendamentos"
      className="space-y-3 px-3 pb-4 pt-1 min-[380px]:px-4"
    >
      {appointmentsHistoryMobileSkeletonCards.map((card) => (
        <div
          key={`appointments-history-mobile-card-${card}`}
          className="grid grid-cols-[3.75rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-border/70 bg-background/45 shadow-xs min-[380px]:grid-cols-[4.25rem_minmax(0,1fr)]"
        >
          <div className="flex flex-col justify-center border-r border-border/70 px-2 py-4 min-[380px]:px-3">
            <Skeleton className="mx-auto h-4 w-10" />
            <Skeleton className="mx-auto mt-2 h-3 w-10" />
          </div>

          <div className="min-w-0 px-3 py-3 min-[380px]:px-4">
            <div className="grid gap-2 min-[400px]:grid-cols-[minmax(0,1fr)_auto] min-[400px]:items-start">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-28" />
                <div className="mt-2 flex flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-14 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="mt-3 flex flex-col gap-1 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between min-[400px]:gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-14 self-end min-[400px]:self-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
