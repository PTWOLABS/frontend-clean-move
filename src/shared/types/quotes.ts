import type { QuotesApiFilters } from "@/features/quotes/types/api-filters";

export type QuotesQueryKeyParams = {
  filters?: QuotesApiFilters;
  quoteId?: string;
};
