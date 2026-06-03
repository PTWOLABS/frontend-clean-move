import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const loadingRows = ["first", "second", "third", "fourth", "fifth"];

export function TodayAgendaLoadingState() {
  return (
    <div role="status" aria-label="Carregando agendamentos" className="divide-y divide-border/60">
      {loadingRows.map((row) => (
        <div
          key={row}
          className="grid h-[151.78px] gap-3 px-4 py-4 sm:h-[87.5px] sm:grid-cols-[5rem_minmax(0,1fr)_minmax(9rem,auto)] sm:items-center sm:px-6"
        >
          <div className="flex items-center gap-4 sm:gap-3">
            <div className="flex min-w-12 flex-col">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="mt-1 h-4 w-12" />
            </div>
            <Separator className="hidden h-8 sm:block" orientation="vertical" />
          </div>

          <div className="min-w-0">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="mt-2 h-3 w-56 max-w-full" />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
