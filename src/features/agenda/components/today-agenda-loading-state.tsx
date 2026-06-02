import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const loadingRows = ["first", "second", "third", "fourth", "fifth", "sixth"];

export function TodayAgendaLoadingState() {
  return (
    <div role="status" aria-label="Carregando agendamentos" className="divide-y divide-border/60">
      {loadingRows.map((row) => (
        <div
          key={row}
          className="grid gap-3 px-4 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_minmax(9rem,auto)] sm:items-center sm:px-6 h-[151.78px] sm:h-[87.5px]"
        >
          <div className="flex items-center gap-4 sm:gap-3">
            <Skeleton className="h-4 w-12" />
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
