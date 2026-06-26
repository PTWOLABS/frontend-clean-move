import type { DateRange } from "react-day-picker";

import type { QuotesApiFilters } from "../types/api-filters";

export type QuotesSearchField = "customerName" | "vehiclePlate" | "serviceName";

export type QuotesConvertedFilter = "all" | "converted" | "not-converted";

export type QuotesFiltersState = {
  searchField: QuotesSearchField;
  search: string;
  converted: QuotesConvertedFilter;
  expiresRange?: DateRange;
};

export const DEFAULT_QUOTES_FILTERS: QuotesFiltersState = {
  searchField: "customerName",
  search: "",
  converted: "all",
  expiresRange: undefined,
};

function formatDateFilter(date: Date | undefined): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEndOfDayDateFilter(date: Date | undefined): string | undefined {
  const formattedDate = formatDateFilter(date);

  if (!formattedDate) return undefined;

  return `${formattedDate}T23:59:59.999`;
}

export function buildQuotesApiFilters(
  filters: QuotesFiltersState,
  pagination?: Pick<QuotesApiFilters, "page" | "size">,
): QuotesApiFilters {
  const search = filters.search.trim();
  const apiFilters: QuotesApiFilters = {
    ...pagination,
    converted: filters.converted === "all" ? undefined : filters.converted === "converted",
    expiresFrom: formatDateFilter(filters.expiresRange?.from),
    expiresTo: formatEndOfDayDateFilter(filters.expiresRange?.to),
  };

  if (search) {
    apiFilters[filters.searchField] = search;
  }

  return apiFilters;
}
