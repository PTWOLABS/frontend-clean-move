import { httpClient } from "@/shared/api/httpClient";

import { buildUpdateServicePayload } from "../lib/build-update-service-payload";
import { mapServiceDtoToServiceItem } from "../lib/normalize-services-list";
import type { UpdateServicePayload, UpdateServiceResponse } from "../types";

export async function updateService(serviceId: string, body: UpdateServicePayload) {
  const payload = buildUpdateServicePayload(body);

  const response = await httpClient<UpdateServiceResponse>(`/services/${serviceId}`, {
    method: "PATCH",
    body: payload,
  });

  return {
    service: mapServiceDtoToServiceItem(response.service),
  };
}
