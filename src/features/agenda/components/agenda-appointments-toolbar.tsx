"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/calendar/date-picker-with-range";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { SearchSelectInput } from "@/shared/components/search-select-input";

import { periodModeOptions, searchFieldOptions, statusFilterOptions } from "../constants";
import type { AgendaPeriodMode, AgendaSearchField, AgendaStatusFilter } from "../types";
import type { AgendaFiltersState } from "../lib/agenda-filters-storage";

type ActiveAgendaFilterBadge = {
  key: "period" | "status";
  label: string;
};

type AgendaAppointmentsToolbarProps = {
  statusFilter: AgendaStatusFilter;
  searchField: AgendaSearchField;
  search: string;
  periodMode: AgendaPeriodMode;
  appliedFilters: AgendaFiltersState;
  dateRange?: DateRange;
  onStatusChange: (status: AgendaStatusFilter) => void;
  onSearchFieldChange: (field: AgendaSearchField) => void;
  onSearchChange: (search: string) => void;
  onPeriodModeChange: (mode: AgendaPeriodMode) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onClearPeriodFilter: () => void;
  onClearStatusFilter: () => void;
  applyFiltersDisabled: boolean;
  clearFiltersDisabled: boolean;
};

function formatDateRangeFilterLabel(dateRange: DateRange | undefined) {
  if (!dateRange?.from) {
    return "Período personalizado";
  }

  if (!dateRange.to || isSameDay(dateRange.from, dateRange.to)) {
    return format(dateRange.from, "dd/MM/yyyy");
  }

  return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`;
}

export function AgendaAppointmentsToolbar({
  statusFilter,
  searchField,
  search,
  periodMode,
  dateRange,
  appliedFilters,
  onStatusChange,
  onSearchFieldChange,
  onSearchChange,
  onPeriodModeChange,
  onDateRangeChange,
  onApplyFilters,
  onClearFilters,
  onClearPeriodFilter,
  onClearStatusFilter,
  applyFiltersDisabled,
  clearFiltersDisabled,
}: AgendaAppointmentsToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasCustomPeriod = periodMode === "custom";
  const displayedDateRange = hasCustomPeriod ? dateRange : { from: undefined, to: undefined };
  const dateRangePlaceholder = hasCustomPeriod ? "Selecione as datas" : "Definido pelo período";

  function handleApplyFilters() {
    onApplyFilters();
    setFiltersOpen(false);
  }

  const activeFilterBadges = useMemo<ActiveAgendaFilterBadge[]>(() => {
    const badges: ActiveAgendaFilterBadge[] = [];

    if (appliedFilters.statusFilter !== "ALL") {
      const statusFilterLabel = statusFilterOptions.find(
        (status) => status.value === appliedFilters.statusFilter,
      )?.label;

      if (statusFilterLabel) {
        badges.push({
          key: "status",
          label: `Status: ${statusFilterLabel}`,
        });
      }
    }

    if (appliedFilters.periodMode !== "from-today") {
      const periodFilterLabel =
        appliedFilters.periodMode === "custom"
          ? formatDateRangeFilterLabel(appliedFilters.dateRange)
          : periodModeOptions.find((period) => period.value === appliedFilters.periodMode)?.label;

      if (periodFilterLabel) {
        badges.push({
          key: "period",
          label: `Período: ${periodFilterLabel}`,
        });
      }
    }

    return badges;
  }, [appliedFilters]);
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (appliedFilters.search.trim().length > 0) {
      count += 1;
    }

    if (appliedFilters.statusFilter !== "ALL") {
      count += 1;
    }

    if (appliedFilters.periodMode !== "from-today") {
      count += 1;
    }

    return count;
  }, [appliedFilters]);
  const shouldShowAppliedFilters = activeFilterBadges.length > 0 || activeFiltersCount > 1;
  const shouldShowClearAllFilters = activeFiltersCount > 1;

  function handleClearFilterBadge(filterKey: ActiveAgendaFilterBadge["key"]) {
    if (filterKey === "status") {
      onClearStatusFilter();
      return;
    }

    onClearPeriodFilter();
  }

  return (
    <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Filtro</span>
        <SearchSelectInput
          value={search}
          onChange={onSearchChange}
          selectValue={searchField}
          onSelectChange={onSearchFieldChange}
          options={searchFieldOptions}
          placeholder="Buscar agendamentos por cliente, veículo ou serviço"
          aria-label="Buscar agendamentos por cliente, veículo, placa ou serviço"
          selectAriaLabel="Campo da busca"
          searchButtonLabel="Buscar agendamentos"
          className="rounded-sm h-10"
          buttonClassName="rounded-sm h-8"
          onSearchClick={onApplyFilters}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onApplyFilters();
            }
          }}
        />
      </div>

      <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center border-border/80 bg-background/60 shadow-xs lg:w-auto"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-popover-foreground">Filtros avançados</p>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <Select
                className="h-10 border-border/80 bg-background/60 shadow-xs"
                options={statusFilterOptions}
                value={statusFilter}
                onChange={onStatusChange}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Período</span>
              <Select
                className="h-10 border-border/80 bg-background/60 shadow-xs"
                options={periodModeOptions}
                value={periodMode}
                onChange={onPeriodModeChange}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Datas</span>
              <DatePickerWithRange
                align="start"
                side="top"
                className="h-10 w-full border-border/80 bg-background/60 shadow-xs md:min-w-0"
                disabled={!hasCustomPeriod}
                placeholder={dateRangePlaceholder}
                value={displayedDateRange}
                onChange={onDateRangeChange}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 items-center">
              <ClearFiltersButton
                className="h-10 w-full border-border/80 bg-background/60 shadow-xs lg:w-auto"
                disabled={clearFiltersDisabled}
                onClick={onClearFilters}
              />
              <Button type="button" disabled={applyFiltersDisabled} onClick={handleApplyFilters}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {shouldShowAppliedFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:col-span-2">
          {activeFilterBadges.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="gap-1.5 rounded-full border-border/80 bg-background/60 py-1 pr-1 pl-2.5 text-muted-foreground shadow-xs"
            >
              <span>{filter.label}</span>
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label={`Remover filtro ${filter.label}`}
                onClick={() => handleClearFilterBadge(filter.key)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}

          {shouldShowClearAllFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
              disabled={clearFiltersDisabled}
              onClick={onClearFilters}
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Limpar todos
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
