import type { DateRange } from "react-day-picker";

import type { QuotesApiFilters } from "../types/api-filters";
import type { QuoteListItemDto } from "../types/quotes";

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

export function buildQuotesApiFilters(
  filters: QuotesFiltersState,
  pagination?: Pick<QuotesApiFilters, "page" | "size">,
): QuotesApiFilters {
  const search = filters.search.trim();
  const apiFilters: QuotesApiFilters = {
    ...pagination,
    converted: filters.converted === "all" ? undefined : filters.converted === "converted",
    expiresFrom: formatDateFilter(filters.expiresRange?.from),
    expiresTo: formatDateFilter(filters.expiresRange?.to),
  };

  if (search) {
    apiFilters[filters.searchField] = search;
  }

  return apiFilters;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

function matchesSearch(quote: QuoteListItemDto, filters: QuotesFiltersState): boolean {
  const search = normalizeText(filters.search);
  if (!search) return true;

  if (filters.searchField === "customerName") {
    return normalizeText(quote.customerName).includes(search);
  }

  if (filters.searchField === "vehiclePlate") {
    return normalizeText(quote.vehiclePlate).includes(search);
  }

  return normalizeText(quote.vehicleLabel).includes(search);
}

function matchesConverted(quote: QuoteListItemDto, filter: QuotesConvertedFilter): boolean {
  if (filter === "all") return true;
  return filter === "converted" ? quote.status === "APPROVED" : quote.status !== "APPROVED";
}

function matchesExpirationRange(quote: QuoteListItemDto, range: DateRange | undefined): boolean {
  if (!range?.from && !range?.to) return true;
  if (!quote.expiresAt) return false;

  const expiresAt = new Date(quote.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;

  if (range.from && expiresAt < range.from) return false;
  if (range.to) {
    const endOfDay = new Date(range.to);
    endOfDay.setHours(23, 59, 59, 999);
    if (expiresAt > endOfDay) return false;
  }

  return true;
}

export function filterQuotesMock(
  quotes: QuoteListItemDto[],
  filters: QuotesFiltersState,
): QuoteListItemDto[] {
  return quotes.filter(
    (quote) =>
      matchesSearch(quote, filters) &&
      matchesConverted(quote, filters.converted) &&
      matchesExpirationRange(quote, filters.expiresRange),
  );
}
