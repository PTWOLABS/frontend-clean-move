import { httpClient } from "@/shared/api/httpClient";

import type {
  ServiceCategoryOptionsQuery,
  ServiceCategoryOptionsResponse,
} from "../types";

export async function listServiceCategoryOptions(
  filters?: ServiceCategoryOptionsQuery,
  signal?: AbortSignal,
) {
  return httpClient<ServiceCategoryOptionsResponse, ServiceCategoryOptionsQuery>(
    "/service-categories/options",
    { filters, signal },
  );
}
