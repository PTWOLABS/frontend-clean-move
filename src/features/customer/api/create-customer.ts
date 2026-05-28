import { httpClient } from "@/shared/api/httpClient";

import type { CreateCustomerPayload, CustomerDto } from "../types";

type CreateCustomerResponse = {
  customer: CustomerDto;
};

export async function createCustomer(payload: CreateCustomerPayload) {
  return httpClient<CreateCustomerResponse>("/customers", {
    method: "POST",
    body: payload,
  });
}
