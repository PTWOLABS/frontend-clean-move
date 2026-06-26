"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type CatalogPaginationItemLabel = {
  singular: string;
  plural: string;
};

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: CatalogPaginationItemLabel;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

export function CatalogPagination({
  page,
  totalPages,
  total,
  itemLabel,
  isFetching = false,
  onPageChange,
  className,
}: CatalogPaginationProps) {
  const normalizedTotalPages = Math.max(1, totalPages);
  const normalizedPage = Math.min(Math.max(1, page), normalizedTotalPages);
  const canPrev = normalizedPage > 1;
  const canNext = normalizedPage < normalizedTotalPages;
  const navDisabled = isFetching;
  const progressPercent = Math.min(100, Math.max(0, (normalizedPage / normalizedTotalPages) * 100));
  const totalLabel = total === 1 ? itemLabel.singular : itemLabel.plural;

  return (
    <div className={cn("space-y-4 border-t border-border pt-4", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-primary/85 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{total}</span> {totalLabel}
            <span className="mx-2 text-border">/</span>
            <span className="tabular-nums">
              página <span className="font-medium text-foreground">{normalizedPage}</span> de{" "}
              <span className="font-medium text-foreground">{normalizedTotalPages}</span>
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
              onClick={() => onPageChange(Math.max(1, normalizedPage - 1))}
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
                  <span className="sr-only">Carregando resultados</span>
                </>
              ) : (
                `${normalizedPage}/${normalizedTotalPages}`
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
              onClick={() => onPageChange(normalizedPage + 1)}
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
