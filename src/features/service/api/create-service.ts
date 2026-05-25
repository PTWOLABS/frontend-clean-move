import { httpClient } from "@/shared/api/httpClient";

import type { CreateServicePayload } from "../types";

export async function createService(payload: CreateServicePayload) {
  return httpClient<unknown>("/services", {
    method: "POST",
    body: payload,
  });
}
