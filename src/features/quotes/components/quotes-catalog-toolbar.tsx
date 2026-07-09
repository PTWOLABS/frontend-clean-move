"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/calendar/date-picker-with-range";
import { Select } from "@/components/ui/select/select";
import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import {
  FilterToolbarShell,
  type FilterToolbarBadge,
} from "@/shared/components/filter-toolbar-shell";
import { SearchSelectInput } from "@/shared/components/search-select-input";
import { formatDateBR } from "@/shared/lib/date-time";

import {
  DEFAULT_QUOTES_FILTERS,
  type QuotesConvertedFilter,
  type QuotesFiltersState,
  type QuotesSearchField,
  type QuotesSortFilter,
} from "../lib/build-quotes-api-filters";

type QuotesCatalogToolbarProps = {
  filters: QuotesFiltersState;
  appliedFilters: QuotesFiltersState;
  onFiltersChange: (filters: QuotesFiltersState) => void;
  onApplyFilters: (filters: QuotesFiltersState) => void;
  onClearFilters: () => void;
};

const searchFieldOptions: { label: string; value: QuotesSearchField }[] = [
  { label: "Cliente", value: "customerName" },
  { label: "Placa", value: "vehiclePlate" },
  { label: "Serviço", value: "serviceName" },
];

const convertedFilterOptions: { label: string; value: QuotesConvertedFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Convertidos", value: "converted" },
  { label: "Não convertidos", value: "not-converted" },
];

const ordenationFilterOptions: { label: string; value: QuotesSortFilter }[] = [
  { label: "Mais recentes", value: "recent" },
  { label: "Mais antigos", value: "oldest" },
];

function formatDateRangeLabel(dateRange: DateRange | undefined): string {
  if (!dateRange?.from) return "Vencimento personalizado";

  if (!dateRange.to) return formatDateBR(dateRange.from);

  return `${formatDateBR(dateRange.from)} - ${formatDateBR(dateRange.to)}`;
}

function areDateRangesEqual(left: DateRange | undefined, right: DateRange | undefined): boolean {
  return (
    (left?.from?.getTime() ?? null) === (right?.from?.getTime() ?? null) &&
    (left?.to?.getTime() ?? null) === (right?.to?.getTime() ?? null)
  );
}

function areFiltersEqual(left: QuotesFiltersState, right: QuotesFiltersState): boolean {
  return (
    left.search === right.search &&
    left.searchField === right.searchField &&
    left.converted === right.converted &&
    left.sort === right.sort &&
    areDateRangesEqual(left.expiresRange, right.expiresRange)
  );
}

function getSearchFieldLabel(field: QuotesSearchField): string {
  return searchFieldOptions.find((option) => option.value === field)?.label ?? "Busca";
}

function getConvertedFilterLabel(value: QuotesConvertedFilter): string | undefined {
  if (value === "all") return undefined;
  return convertedFilterOptions.find((option) => option.value === value)?.label;
}

function getSortFilterLabel(value: QuotesSortFilter): string {
  return ordenationFilterOptions.find((option) => option.value === value)?.label ?? "Mais recentes";
}

export function QuotesCatalogToolbar({
  filters,
  appliedFilters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: QuotesCatalogToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateRangeValue = filters.expiresRange ?? { from: undefined, to: undefined };
  const applyFiltersDisabled = areFiltersEqual(filters, appliedFilters);
  const clearFiltersDisabled = areFiltersEqual(appliedFilters, DEFAULT_QUOTES_FILTERS);

  function updateFilters(partial: Partial<QuotesFiltersState>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function applyNextFilters(nextFilters: QuotesFiltersState) {
    onFiltersChange(nextFilters);
    onApplyFilters(nextFilters);
  }

  function handleApplyFilters() {
    onApplyFilters(filters);
    setFiltersOpen(false);
  }

  const activeFilterBadges: FilterToolbarBadge[] = [];

  if (appliedFilters.search.trim()) {
    activeFilterBadges.push({
      key: "search",
      label: `${getSearchFieldLabel(appliedFilters.searchField)}: ${appliedFilters.search.trim()}`,
      onRemove: () =>
        applyNextFilters({
          ...appliedFilters,
          search: "",
        }),
    });
  }

  const convertedLabel = getConvertedFilterLabel(appliedFilters.converted);
  if (convertedLabel) {
    activeFilterBadges.push({
      key: "converted",
      label: `Conversão: ${convertedLabel}`,
      onRemove: () =>
        applyNextFilters({
          ...appliedFilters,
          converted: "all",
        }),
    });
  }

  if (appliedFilters.sort !== DEFAULT_QUOTES_FILTERS.sort) {
    activeFilterBadges.push({
      key: "sort",
      label: `Ordenação: ${getSortFilterLabel(appliedFilters.sort)}`,
      onRemove: () =>
        applyNextFilters({
          ...appliedFilters,
          sort: DEFAULT_QUOTES_FILTERS.sort,
        }),
    });
  }

  if (appliedFilters.expiresRange?.from || appliedFilters.expiresRange?.to) {
    activeFilterBadges.push({
      key: "expires",
      label: `Vencimento: ${formatDateRangeLabel(appliedFilters.expiresRange)}`,
      onRemove: () =>
        applyNextFilters({
          ...appliedFilters,
          expiresRange: undefined,
        }),
    });
  }

  return (
    <FilterToolbarShell
      filtersOpen={filtersOpen}
      onFiltersOpenChange={setFiltersOpen}
      activeFilters={activeFilterBadges}
      clearAllDisabled={clearFiltersDisabled}
      onClearAll={onClearFilters}
      searchControl={
        <SearchSelectInput
          value={filters.search}
          onChange={(search) => updateFilters({ search })}
          selectValue={filters.searchField}
          onSelectChange={(searchField) => updateFilters({ searchField })}
          options={searchFieldOptions}
          placeholder="Buscar por cliente, placa ou serviço"
          aria-label="Buscar orçamentos por cliente, placa ou serviço"
          selectAriaLabel="Campo da busca"
          searchButtonLabel="Buscar orçamentos"
          className="h-10 rounded-sm"
          buttonClassName="h-8 rounded-sm"
          onSearchClick={handleApplyFilters}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleApplyFilters();
            }
          }}
        />
      }
    >
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
        <Select
          className="h-10 border-border/80 bg-background/60 shadow-xs"
          options={ordenationFilterOptions}
          value={filters.sort}
          onChange={(sort) => updateFilters({ sort })}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Conversão</span>
        <Select
          className="h-10 border-border/80 bg-background/60 shadow-xs"
          options={convertedFilterOptions}
          value={filters.converted}
          onChange={(converted) => updateFilters({ converted })}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Vencimento</span>
        <DatePickerWithRange
          align="start"
          side="top"
          className="h-10 w-full border-border/80 bg-background/60 shadow-xs md:min-w-0"
          placeholder="Selecione as datas"
          value={dateRangeValue}
          onChange={(expiresRange) => updateFilters({ expiresRange })}
          numberOfMonths={1}
        />
      </label>

      <div className="grid grid-cols-2 items-center gap-2">
        <ClearFiltersButton
          className="h-10 w-full border-border/80 bg-background/60 shadow-xs lg:w-auto"
          disabled={clearFiltersDisabled}
          onClick={onClearFilters}
        />
        <Button type="button" disabled={applyFiltersDisabled} onClick={handleApplyFilters}>
          Aplicar filtros
        </Button>
      </div>
    </FilterToolbarShell>
  );
}
