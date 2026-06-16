import { httpClient } from "@/shared/api/httpClient";

import type { ServiceCategoryResponse, UpdateServiceCategoryPayload } from "../types";

export async function updateServiceCategory(
  categoryId: string,
  payload: UpdateServiceCategoryPayload,
) {
  return httpClient<ServiceCategoryResponse>(`/service-categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
  });
}
