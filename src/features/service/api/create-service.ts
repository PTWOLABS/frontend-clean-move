import { httpClient } from "@/shared/api/httpClient";

import { mapServiceDtoToServiceItem } from "../lib/normalize-services-list";
import type { CreateServicePayload, CreateServiceResponse } from "../types";

export async function createService(payload: CreateServicePayload) {
  const response = await httpClient<CreateServiceResponse>("/services", {
    method: "POST",
    body: payload,
  });

  return {
    service: mapServiceDtoToServiceItem(response.service),
  };
}
