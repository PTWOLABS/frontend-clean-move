import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { periodModeOptions, searchFieldOptions, statusFilterOptions } from "../constants";
import type { AgendaPeriodMode, AgendaSearchField, AgendaStatusFilter } from "../types";

const AGENDA_FILTERS_STORAGE_KEY = "clean-move:agenda:appointment-filters";
const DEFAULT_AGENDA_PERIOD_MODE: AgendaPeriodMode = "from-today";

type StoredAgendaFilters = {
  statusFilter?: AgendaStatusFilter;
  searchField?: AgendaSearchField;
  search?: string;
  periodMode?: AgendaPeriodMode;
  dateRange?: {
    from?: string;
    to?: string;
  };
};

export type AgendaFiltersState = {
  statusFilter: AgendaStatusFilter;
  searchField: AgendaSearchField;
  search: string;
  periodMode: AgendaPeriodMode;
  dateRange?: DateRange;
};

function getDefaultAgendaDateRange(): DateRange {
  const today = new Date();

  return {
    from: addDays(today, -6),
    to: today,
  };
}

function isAgendaStatusFilter(value: unknown): value is AgendaStatusFilter {
  return statusFilterOptions.some((option) => option.value === value);
}

function isAgendaSearchField(value: unknown): value is AgendaSearchField {
  return searchFieldOptions.some((option) => option.value === value);
}

function isAgendaPeriodMode(value: unknown): value is AgendaPeriodMode {
  return periodModeOptions.some((option) => option.value === value);
}

function parseStoredDate(value: unknown) {
  if (typeof value !== "string") return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseStoredDateRange(value: unknown): DateRange | undefined {
  if (!value || typeof value !== "object") return undefined;

  const dateRange = value as StoredAgendaFilters["dateRange"];
  const from = parseStoredDate(dateRange?.from);
  const to = parseStoredDate(dateRange?.to);

  if (!from && !to) return undefined;

  return { from, to };
}

function readStoredAgendaFilters(): StoredAgendaFilters | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const rawFilters = window.localStorage.getItem(AGENDA_FILTERS_STORAGE_KEY);

    if (!rawFilters) return undefined;

    const parsedFilters = JSON.parse(rawFilters);

    if (!parsedFilters || typeof parsedFilters !== "object") return undefined;

    return parsedFilters as StoredAgendaFilters;
  } catch {
    return undefined;
  }
}

export function getInitialAgendaFiltersState(): AgendaFiltersState {
  const defaultFilters: AgendaFiltersState = {
    statusFilter: "ALL",
    searchField: "serviceName",
    search: "",
    periodMode: DEFAULT_AGENDA_PERIOD_MODE,
    dateRange: getDefaultAgendaDateRange(),
  };
  const storedFilters = readStoredAgendaFilters();

  if (!storedFilters) return defaultFilters;

  return {
    statusFilter:
      storedFilters.statusFilter && isAgendaStatusFilter(storedFilters.statusFilter)
        ? storedFilters.statusFilter
        : defaultFilters.statusFilter,
    searchField:
      storedFilters.searchField && isAgendaSearchField(storedFilters.searchField)
        ? storedFilters.searchField
        : defaultFilters.searchField,
    search: typeof storedFilters.search === "string" ? storedFilters.search : defaultFilters.search,
    periodMode:
      storedFilters.periodMode && isAgendaPeriodMode(storedFilters.periodMode)
        ? storedFilters.periodMode
        : defaultFilters.periodMode,
    dateRange: parseStoredDateRange(storedFilters.dateRange) ?? defaultFilters.dateRange,
  };
}

export function persistAgendaFilters(filters: AgendaFiltersState) {
  const filtersToStore: StoredAgendaFilters = {
    statusFilter: filters.statusFilter,
    searchField: filters.searchField,
    search: filters.search,
    periodMode: filters.periodMode,
    dateRange: filters.dateRange
      ? {
          from: filters.dateRange.from?.toISOString(),
          to: filters.dateRange.to?.toISOString(),
        }
      : undefined,
  };

  try {
    window.localStorage.setItem(AGENDA_FILTERS_STORAGE_KEY, JSON.stringify(filtersToStore));
  } catch {
    // Ignore storage failures so filters keep working during the current session.
  }
}
