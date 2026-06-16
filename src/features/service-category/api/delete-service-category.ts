import { httpClient } from "@/shared/api/httpClient";

import type { ServiceCategoryResponse } from "../types";

export async function deleteServiceCategory(categoryId: string) {
  return httpClient<ServiceCategoryResponse>(`/service-categories/${categoryId}`, {
    method: "DELETE",
  });
}
