import type { DateRange } from "react-day-picker";

import type { QuotesApiFilters } from "../types/api-filters";

export type QuotesSearchField = "customerName" | "vehiclePlate" | "serviceName";

export type QuotesConvertedFilter = "all" | "converted" | "not-converted";

export type QuotesSortFilter = NonNullable<QuotesApiFilters["sort"]>;

export type QuotesFiltersState = {
  searchField: QuotesSearchField;
  search: string;
  converted: QuotesConvertedFilter;
  sort: QuotesSortFilter;
  expiresRange?: DateRange;
};

export const DEFAULT_QUOTES_FILTERS: QuotesFiltersState = {
  searchField: "customerName",
  search: "",
  converted: "all",
  sort: "recent",
  expiresRange: undefined,
};

function formatDateFilter(date: Date | undefined, time: string): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${time}Z`;
}

function formatStartOfDayDateFilter(date: Date | undefined): string | undefined {
  return formatDateFilter(date, "00:00:00.000");
}

function formatEndOfDayDateFilter(date: Date | undefined): string | undefined {
  return formatDateFilter(date, "23:59:59.999");
}

export function buildQuotesApiFilters(
  filters: QuotesFiltersState,
  pagination?: Pick<QuotesApiFilters, "page" | "size">,
): QuotesApiFilters {
  const search = filters.search.trim();
  const apiFilters: QuotesApiFilters = {
    ...pagination,
    sort: filters.sort,
    converted: filters.converted === "all" ? undefined : filters.converted === "converted",
    expiresFrom: formatStartOfDayDateFilter(filters.expiresRange?.from),
    expiresTo: formatEndOfDayDateFilter(filters.expiresRange?.to),
  };

  if (search) {
    apiFilters[filters.searchField] = search;
  }

  return apiFilters;
}
