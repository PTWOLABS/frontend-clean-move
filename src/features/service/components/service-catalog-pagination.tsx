"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type ServiceCatalogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  /** Enquanto a query está a buscar (ex.: mudança de página), mostra spinner e bloqueia os botões. */
  isFetching?: boolean;
  onPageChange: (page: number) => void;
};

export function ServiceCatalogPagination({
  page,
  totalPages,
  total,
  isFetching = false,
  onPageChange,
}: ServiceCatalogPaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const navDisabled = isFetching;
  const progressPercent =
    totalPages > 0 ? Math.min(100, Math.max(0, (page / totalPages) * 100)) : 0;

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-primary/85 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{total}</span>
            {total === 1 ? " serviço" : " serviços"}
            <span className="mx-2 text-border">·</span>
            <span className="tabular-nums">
              página <span className="font-medium text-foreground">{page}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
          </p>
        </div>

        <nav
          aria-label="Navegação entre páginas"
          aria-busy={navDisabled}
          className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3"
        >
          <div className="inline-flex w-full rounded-xl border border-border bg-muted/40 p-1 shadow-sm sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canPrev || navDisabled}
              className={cn(
                "h-9 flex-1 gap-1.5 rounded-lg px-3 font-medium sm:flex-initial sm:px-4",
                "hover:bg-background/80",
                (!canPrev || navDisabled) && "opacity-40",
              )}
              aria-label="Ir para a página anterior"
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <div
              className={cn(
                "flex min-h-9 min-w-15 shrink-0 select-none items-center justify-center rounded-md border-x border-border/80 bg-background/50 px-2 text-xs font-semibold tabular-nums text-foreground",
                isFetching && "text-muted-foreground",
              )}
              aria-hidden={!isFetching ? true : undefined}
              aria-live={isFetching ? "polite" : undefined}
            >
              {isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span className="sr-only">A carregar resultados</span>
                </>
              ) : (
                `${page}/${totalPages}`
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canNext || navDisabled}
              className={cn(
                "h-9 flex-1 gap-1.5 rounded-lg px-3 font-medium sm:flex-initial sm:px-4",
                "hover:bg-background/80",
                (!canNext || navDisabled) && "opacity-40",
              )}
              aria-label="Ir para a página seguinte"
              onClick={() => onPageChange(page + 1)}
            >
              <span className="hidden sm:inline">Seguinte</span>
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
