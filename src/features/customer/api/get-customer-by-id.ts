import { httpClient } from "@/shared/api/httpClient";

import type { CustomerDto } from "../types";

type GetCustomerByIdResponse = {
  customer: CustomerDto;
};

export async function getCustomerById(customerId: string, signal?: AbortSignal) {
  const response = await httpClient<GetCustomerByIdResponse>(`/customers/${customerId}`, {
    signal,
  });

  return response.customer;
}
