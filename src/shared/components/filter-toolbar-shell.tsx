"use client";

import type { ReactNode } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/shared/utils/cn";

export type FilterToolbarBadge = {
  key: string;
  label: string;
  onRemove?: () => void;
};

type FilterToolbarShellProps = {
  searchControl: ReactNode;
  children: ReactNode;
  activeFilters?: FilterToolbarBadge[];
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  title?: string;
  filterButtonLabel?: string;
  clearAllLabel?: string;
  clearAllDisabled?: boolean;
  onClearAll?: () => void;
  className?: string;
  popoverClassName?: string;
};

export function FilterToolbarShell({
  searchControl,
  children,
  activeFilters = [],
  filtersOpen,
  onFiltersOpenChange,
  title = "Filtros avancados",
  filterButtonLabel = "Filtros",
  clearAllLabel = "Limpar todos",
  clearAllDisabled = false,
  onClearAll,
  className,
  popoverClassName,
}: FilterToolbarShellProps) {
  const shouldShowActiveFilters = activeFilters.length > 0;
  const shouldShowClearAll = Boolean(onClearAll) && activeFilters.length > 1;

  return (
    <div className={cn("grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end", className)}>
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Filtro</span>
        {searchControl}
      </div>

      <Popover open={filtersOpen} onOpenChange={onFiltersOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center border-border/80 bg-background/60 shadow-xs lg:w-auto"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {filterButtonLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={cn("w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4", popoverClassName)}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-popover-foreground">{title}</p>
            </div>
            {children}
          </div>
        </PopoverContent>
      </Popover>

      {shouldShowActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="gap-1.5 rounded-full border-border/80 bg-background/60 py-1 pl-2.5 pr-1 text-muted-foreground shadow-xs"
            >
              <span>{filter.label}</span>
              {filter.onRemove ? (
                <button
                  type="button"
                  className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label={`Remover filtro ${filter.label}`}
                  onClick={filter.onRemove}
                >
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
            </Badge>
          ))}

          {shouldShowClearAll ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
              disabled={clearAllDisabled}
              onClick={onClearAll}
            >
              <RotateCcw className="size-3.5" aria-hidden />
              {clearAllLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
