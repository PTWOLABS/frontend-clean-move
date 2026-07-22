import { httpClient } from "@/shared/api/httpClient";
import type { OptionsListParams } from "@/shared/types/options-query";

import type { ServiceOptionsDTO } from "../types/options-dto";

export async function listServiceOptions(filters?: OptionsListParams, signal?: AbortSignal) {
  return await httpClient<ServiceOptionsDTO, OptionsListParams>("/services/options", {
    filters,
    signal,
  });
}
