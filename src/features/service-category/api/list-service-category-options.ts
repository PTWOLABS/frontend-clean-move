import { httpClient } from "@/shared/api/httpClient";
import type { OptionsListParams } from "@/shared/types/options-query";

import type { ServiceCategoryOptionsResponse } from "../types";

export async function listServiceCategoryOptions(
  filters?: OptionsListParams,
  signal?: AbortSignal,
) {
  return httpClient<ServiceCategoryOptionsResponse, OptionsListParams>(
    "/service-categories/options",
    { filters, signal },
  );
}
