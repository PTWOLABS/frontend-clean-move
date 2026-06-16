import { httpClient } from "@/shared/api/httpClient";
import { OptionsFilters } from "../types/api-filters";
import { CustomerOptionsDTO } from "../types/options-dto";

export async function listCustomerOptions(filters?: OptionsFilters) {
  return await httpClient<CustomerOptionsDTO, OptionsFilters>("/customers/options", {
    filters,
  });
}
