"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/calendar/date-picker-with-range";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { SearchSelectInput } from "@/shared/components/search-select-input";

import { periodModeOptions, searchFieldOptions, statusFilterOptions } from "../constants";
import type { AgendaPeriodMode, AgendaSearchField, AgendaStatusFilter } from "../types";

type AgendaAppointmentsToolbarProps = {
  statusFilter: AgendaStatusFilter;
  searchField: AgendaSearchField;
  search: string;
  periodMode: AgendaPeriodMode;
  dateRange?: DateRange;
  onStatusChange: (status: AgendaStatusFilter) => void;
  onSearchFieldChange: (field: AgendaSearchField) => void;
  onSearchChange: (search: string) => void;
  onPeriodModeChange: (mode: AgendaPeriodMode) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  applyFiltersDisabled: boolean;
  clearFiltersDisabled: boolean;
};

export function AgendaAppointmentsToolbar({
  statusFilter,
  searchField,
  search,
  periodMode,
  dateRange,
  onStatusChange,
  onSearchFieldChange,
  onSearchChange,
  onPeriodModeChange,
  onDateRangeChange,
  onApplyFilters,
  onClearFilters,
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
    </div>
  );
}
