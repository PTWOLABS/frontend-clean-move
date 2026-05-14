import { httpClient } from "@/shared/api/httpClient";

import type { CreateServicePayload } from "../types";

export async function updateService(serviceId: string, body: CreateServicePayload) {
  return httpClient<unknown>(`/services/${serviceId}`, {
    method: "PATCH",
    body,
  });
}
