"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/calendar/date-picker-with-range";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";

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
}: AgendaAppointmentsToolbarProps) {
  const hasAllPeriod = periodMode === "all";
  const displayedDateRange = hasAllPeriod ? { from: undefined, to: undefined } : dateRange;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(10rem,0.8fr)_minmax(12rem,0.9fr)_minmax(0,1.7fr)_auto] lg:items-end">
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
        <span className="text-xs font-medium text-muted-foreground">Buscar por</span>
        <Select
          className="h-10 border-border/80 bg-background/60 shadow-xs"
          options={searchFieldOptions}
          value={searchField}
          onChange={onSearchFieldChange}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Filtro</span>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="h-10 border-border/80 bg-background/60 pl-9 shadow-xs"
            placeholder="Digite para filtrar"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </label>

      <Popover>
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
              <p className="text-xs text-muted-foreground">
                Refine a consulta por período sem ocupar espaço da lista.
              </p>
            </div>

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
                disabled={hasAllPeriod}
                placeholder="Todo o período"
                value={displayedDateRange}
                onChange={onDateRangeChange}
              />
            </label>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
