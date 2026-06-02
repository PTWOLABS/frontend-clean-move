import { Button } from "@/components/ui/button";
import { AGENDA_PAGE_SIZE } from "../constants";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type AgendaAppointmentsPaginationProps = {
  page: number;
  totalItems?: number;
  visibleItemsCount: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export function AgendaAppointmentsPagination({
  page,
  totalItems,
  visibleItemsCount,
  isFetching,
  onPageChange,
}: AgendaAppointmentsPaginationProps) {
  const hasTotal = typeof totalItems === "number";
  const totalPages = hasTotal ? Math.max(1, Math.ceil(totalItems / AGENDA_PAGE_SIZE)) : null;
  const canPrev = page > 1;
  const canNext = totalPages ? page < totalPages : visibleItemsCount >= AGENDA_PAGE_SIZE;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground md:justify-start md:text-left">
        {hasTotal ? (
          <>
            <span className="whitespace-nowrap">
              <span className="font-semibold tabular-nums text-foreground">{totalItems}</span>
              {totalItems === 1 ? " agendamento" : " agendamentos"}
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span className="whitespace-nowrap tabular-nums">
              página <span className="font-medium text-foreground">{page}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
          </>
        ) : (
          <span className="tabular-nums">
            página <span className="font-medium text-foreground">{page}</span>
          </span>
        )}
      </p>

      <nav
        className="w-full md:w-auto"
        aria-label="Navegação entre páginas de agendamentos"
        aria-busy={isFetching}
      >
        <div className="inline-flex w-full rounded-xl border border-border bg-muted/40 p-1 shadow-sm md:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canPrev || isFetching}
            className="h-9 flex-1 gap-1.5 rounded-lg px-3 font-medium hover:bg-background/80 disabled:opacity-40 md:flex-initial md:px-4"
            aria-label="Ir para a página anterior"
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <div
            className="flex min-h-9 min-w-15 shrink-0 select-none items-center justify-center rounded-md border-x border-border/80 bg-background/50 px-2 text-xs font-semibold tabular-nums text-foreground"
            aria-live={isFetching ? "polite" : undefined}
          >
            {isFetching ? (
              <>
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Carregando agendamentos</span>
              </>
            ) : totalPages ? (
              `${page}/${totalPages}`
            ) : (
              page
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canNext || isFetching}
            className="h-9 flex-1 gap-1.5 rounded-lg px-3 font-medium hover:bg-background/80 disabled:opacity-40 md:flex-initial md:px-4"
            aria-label="Ir para a próxima página"
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Button>
        </div>
      </nav>
    </div>
  );
}
