import { httpClient } from "@/shared/api/httpClient";
import { OptionsFilters } from "../types/api-filters";
import { ServiceOptionsDTO } from "../types/options-dto";

export async function listServiceOptions(filters?: OptionsFilters) {
  return await httpClient<ServiceOptionsDTO, OptionsFilters>("/services/options", {
    filters,
  });
}
