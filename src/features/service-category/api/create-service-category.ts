import { httpClient } from "@/shared/api/httpClient";

import type { CreateServiceCategoryPayload, ServiceCategoryResponse } from "../types";

export async function createServiceCategory(payload: CreateServiceCategoryPayload) {
  return httpClient<ServiceCategoryResponse>("/service-categories", {
    method: "POST",
    body: payload,
  });
}
