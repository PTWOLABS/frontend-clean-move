import { httpClient } from "@/shared/api/httpClient";
import type { QuotesApiFilters } from "../types/api-filters";
import type { ListQuotesResponseDto } from "../types/quotes";

export async function listQuotes(filters?: QuotesApiFilters) {
  return await httpClient<ListQuotesResponseDto, QuotesApiFilters>("/quotes", {
    filters,
  });
}
