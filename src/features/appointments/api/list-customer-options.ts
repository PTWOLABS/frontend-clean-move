import { httpClient } from "@/shared/api/httpClient";
import type { OptionsListParams } from "@/shared/types/options-query";

import type { CustomerOptionsDTO } from "../types/options-dto";

export async function listCustomerOptions(
  filters?: OptionsListParams,
  signal?: AbortSignal,
) {
  return await httpClient<CustomerOptionsDTO, OptionsListParams>("/customers/options", {
    filters,
    signal,
  });
}
