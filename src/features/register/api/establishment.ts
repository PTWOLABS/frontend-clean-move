import { httpClient } from "@/shared/api/httpClient";

import type { RegisterEstablishmentPayload, RegisterEstablishmentResponse } from "../types";

export async function registerEstablishment(payload: RegisterEstablishmentPayload) {
  return httpClient<RegisterEstablishmentResponse>("/register/establishment", {
    method: "POST",
    body: payload,
  });
}
