import { httpClient } from "@/shared/api/httpClient";

import type { CustomerDto, UpdateCustomerPayload } from "../types";

type UpdateCustomerResponse = {
  customer: CustomerDto;
};

export async function updateCustomer(customerId: string, payload: UpdateCustomerPayload) {
  return httpClient<UpdateCustomerResponse>(`/customers/${customerId}`, {
    method: "PATCH",
    body: payload,
  });
}
