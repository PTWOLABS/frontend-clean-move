import type { DateRange } from "react-day-picker";

import {
  dateInputValueToEndOfDayPayload,
  dateInputValueToStartOfDayPayload,
  dateToInputValue,
} from "@/shared/lib/date-time";

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

function formatStartOfDayDateFilter(date: Date | undefined): string | undefined {
  const dateInputValue = dateToInputValue(date);
  return dateInputValue
    ? (dateInputValueToStartOfDayPayload(dateInputValue) ?? undefined)
    : undefined;
}

function formatEndOfDayDateFilter(date: Date | undefined): string | undefined {
  const dateInputValue = dateToInputValue(date);
  return dateInputValue
    ? (dateInputValueToEndOfDayPayload(dateInputValue) ?? undefined)
    : undefined;
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
