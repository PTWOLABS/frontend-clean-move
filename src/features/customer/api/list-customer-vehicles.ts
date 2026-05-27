import { httpClient } from "@/shared/api/httpClient";

import type { ListCustomerVehiclesQuery, ListCustomerVehiclesResponse } from "../types";

export async function listCustomerVehicles(
  customerId: string,
  params: ListCustomerVehiclesQuery = {},
  signal?: AbortSignal,
): Promise<ListCustomerVehiclesResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.size) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  const path = query
    ? `/customers/${customerId}/vehicles?${query}`
    : `/customers/${customerId}/vehicles`;

  return httpClient<ListCustomerVehiclesResponse>(path, { signal });
}
